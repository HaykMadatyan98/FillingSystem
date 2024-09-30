import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import mongoose, { Model } from 'mongoose';
import * as csvParser from 'csv-parser';
import * as Stream from 'stream';
import { CompanyFormService } from '@/company-form/company-form.service';
import { ParticipantFormService } from '@/participant-form/participant-form.service';
import { sanitizeData } from '@/utils/sanitizer.util';
import { companyResponseMsgs } from './constants';
import { RequestWithUser } from '@/auth/interfaces/request.interface';
import { formatWithOptions } from 'util';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly participantFormService: ParticipantFormService,
  ) {}

  async addCsvDataIntoDb(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Entered File is Missing');
    }

    const results = [];
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser({ separator: ',', quote: '"' }))
        .on('data', (data: []) => {
          const trimmedData = Object.fromEntries(
            Object.entries(data).map(([key, value]: [string, string]) => [
              key.trim(),
              value.trim(),
            ]),
          );

          results.push(trimmedData);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await Promise.all(results.map((row) => this.changeCompanyData(row)));

    return companyResponseMsgs.csvUploadSuccessful;
  }

  async changeCompanyData(row: any) {
    if (!row['Company Tax Id Number']) {
      throw new BadRequestException('Required data is missing');
    }

    const sanitizedData = await sanitizeData(row);

    const companyFormId = await this.companyFormService.getCompanyFormIdByTaxId(
      sanitizedData.company.taxInfo.taxIdNumber,
    );

    let company =
      companyFormId &&
      (await this.companyModel.findOne({
        'forms.company': companyFormId,
      }));

    if (!company) {
      const ownersIds = [];
      const applicantsIds = [];
      let answerCount = 0;

      const participantsData = await Promise.all(
        sanitizedData.participants.map((participant) =>
          this.participantFormService.createParticipantFormFromCsv(participant),
        ),
      );

      participantsData.forEach((participant) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        participant[0]
          ? applicantsIds.push(participant[1])
          : ownersIds.push(participant[1]);

        answerCount += participant[2];
      });

      const companyForm =
        await this.companyFormService.createCompanyFormFromCsv(
          sanitizedData.company,
        );

      answerCount += companyForm.answerCount;

      company = new this.companyModel({
        ['forms.company']: companyForm.id,
        ['forms.applicants']: applicantsIds,
        ['forms.owners']: ownersIds,
        name: companyForm.companyName,
      });

      company.answersCount = answerCount;
      company.reqFieldsCount =
        company.forms.applicants.length * 15 +
        company.forms.owners.length * 11 +
        9;

      await company.save();
    } else {
      const updatedCompanyForm =
        await this.companyFormService.updateCompanyFormFromCsv(
          sanitizedData.company,
          companyFormId,
        );

      company.answersCount += updatedCompanyForm.answerCountDiff;

      const participantPromises = sanitizedData.participants.map(
        async (participant) => {
          const existParticipant =
            await this.participantFormService.findParticipantFormByDocNumAndIds(
              participant.identificationDetails.docNumber,
              [...company.forms.owners, ...company.forms.applicants],
            );

          if (existParticipant) {
            const changedParticipant =
              await this.participantFormService.changeParticipantForm(
                participant,
                existParticipant['id'],
                participant['isApplicant'],
              );

            company.answersCount += changedParticipant.answerCountDifference;
          } else {
            const newParticipant =
              await this.participantFormService.createParticipantFormFromCsv(
                participant,
              );
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            newParticipant[0]
              ? company.forms.applicants.push(newParticipant[1])
              : company.forms.owners.push(newParticipant[1]);

            company.answersCount += newParticipant[2];
          }
        },
      );

      await Promise.all(participantPromises);

      company.reqFieldsCount =
        company.forms.applicants.length * 15 +
        company.forms.owners.length * 11 +
        9;

      await company.save();
    }
  }

  async getCompaniesByIds(companyIds: string[]) {
    const companies = await this.companyModel.find({
      _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    return companies;
  }

  async getAllCompanies() {
    throw new NotImplementedException('not implemented yet');
  }

  // need some changes after admin part creating
  async createNewCompany(payload: any) {
    const existCompanyForm =
      await this.companyFormService.getCompanyFormByTaxNumber(
        payload.taxIdNumber,
      );

    if (existCompanyForm) {
      throw new ConflictException(
        'Company with that tax number is already created',
      );
    }

    let newCompanyForm = await this.companyFormService.create(payload);
    let newCompany = new this.companyModel();
    newCompany['forms.company'] = newCompanyForm['id'];
    newCompany['reqFieldsCount'] = 9;

    await newCompany.save();

    return { message: 'company was created' };
  }

  async deleteCompanyById(companyId: string): Promise<{ message: string }> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound.message);
    }

    if (company.forms.applicants.length || company.forms.owners.length) {
      const participantsForms = [
        ...company.forms.owners,
        ...company.forms.applicants,
      ].map(async (participant: any) => {
        await this.participantFormService.deleteParticipantFormById(
          participant,
        );
      });

      await Promise.all(participantsForms);
    }

    await this.companyFormService.deleteCompanyFormById(
      company.forms.company as any,
    );

    await this.companyModel.deleteOne({ _id: companyId });

    return { message: 'Company Data succesfully removed' };
  }

  async recalculateReqFields(companyId: string, count: number): Promise<void> {
    let company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company Not Found');
    }

    company.answersCount += count;

    await company.save();
  }

  async getCompanyById(companyId: string) {
    throw new NotImplementedException('not implemented yet');
  }
}
