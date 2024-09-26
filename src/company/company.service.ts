import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import mongoose, { Model } from 'mongoose';
import * as csvParser from 'csv-parser';
import * as Stream from 'stream';
import { CompanyFormService } from '@/company-form/company-form.service';
import { ParticipantFormService } from '@/participant-form/participant-form.service';
import { sanitizeData } from '@/utils/sanitizer.util';
import { companyResponseMsgs } from './constants';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly participantFormService: ParticipantFormService,
  ) {}

  async addCsvDataIntoDb(file: Express.Multer.File) {
    const results = [];
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser({ separator: ',', quote: '"' }))
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await Promise.all(results.map((row) => this.changeCompanyData(row)));

    return companyResponseMsgs.csvUploadSuccesfull;
  }

  async changeCompanyData(row) {
    const companyFormId = await this.companyFormService.getCompanyFormIdByTaxId(
      row['Tax ID Number'],
    );

    let company =
      companyFormId &&
      (await this.companyModel.findOne({
        'forms.company': companyFormId,
      }));

    const sanitizedData = await sanitizeData(row);

    if (!company) {
      const companyForm =
        await this.companyFormService.createCompanyFormFromCsv(
          sanitizedData.company,
        );

      const ownersIds = [];
      const applicantsIds = [];
      let answerCount = companyForm.answerCount;

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

      await Promise.all(
        sanitizedData.participants.map(async (participant) => {
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
                participant['isApplicant'] === 'true' ? true : false,
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

          company.reqFieldsCount =
            company.forms.applicants.length * 15 +
            company.forms.owners.length * 11 +
            9;

          await company.save();
        }),
      );
    }
  }

  async getCompaniesByIds(companyIds: string[]) {
    const companies = await this.companyModel.find({
      _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
    // .select('-forms');

    return companies;
  }

  async createNewCompany(payload: any) {
    console.log(payload);
    throw new NotImplementedException('not implemented yet');
  }

  async deleteCompanyById(companyId: string) {
    console.log(companyId);
    throw new NotImplementedException('not implemented yet');
  }
}
