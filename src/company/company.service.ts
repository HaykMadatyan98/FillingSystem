import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
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
import { ICompanyCSVRowData } from './interfaces/company-csv.interface';
import { ISanitizedData } from './interfaces';
import * as moment from 'moment';
import {
  IRequestUser,
  RequestWithUser,
} from '@/auth/interfaces/request.interface';
import { UserService } from '@/user/user.service';
// import { ICompanyQuery } from './interfaces/query.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly participantFormService: ParticipantFormService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getAllCompanies() {
    const companies = await this.companyModel.find();
    // let selection: string;
    // if (query?.expTime) {
    //   query['expirtionTime'] = query.expirationTime;
    // }

    // if (query?.isFree) {
    //   query['isFree'];
    // }

    // const companies = await this.companyModel
    //   .find()
    //   .limit(query?.size)
    //   .skip(query?.page === 0 ? query?.page : query?.size * query?.page)
    //   .populate({
    //     path: 'user',
    //     model: 'User',
    //     select: 'firstname email',
    //   })
    //   .exec();

    // const countOfNotEntered = await this.companyModel
    //   .countDocuments({ user: '' })
    //   .exec();

    return companies;
  }

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

    // await Promise.all(
    //   results.map(async (row: ICompanyCSVRowData) => {
    //     const sanitizedCompanyData = await sanitizeData(row);
    //   }),
    // );

    await Promise.all(
      results.map(async (row: ICompanyCSVRowData) => {
        const sanitizedCompanyData = await sanitizeData(row);
        await this.changeCompanyData(sanitizedCompanyData);
      }),
    );

    return companyResponseMsgs.csvUploadSuccessful;
  }

  async changeCompanyData(sanitized: ISanitizedData) {
    const companyFormData =
      await this.companyFormService.getCompanyFormByTaxData(
        sanitized.company.taxInfo.taxIdNumber,
        sanitized.company.taxInfo.taxIdType,
      );
    const companyFormId = companyFormData && companyFormData['id'];

    let company =
      companyFormId &&
      (await this.companyModel.findOne({
        'forms.company': companyFormId,
      }));

    if (!company) {
      const ownersIds = [];
      const applicantsIds = [];
      let answerCount = 0;

      if (!sanitized.company.names.legalName) {
        throw new BadRequestException('Company Name is not Exist');
      }

      const participantsData = await Promise.all(
        sanitized.participants.map((participant) =>
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
          sanitized.company,
        );

      answerCount += companyForm.answerCount;

      company = new this.companyModel({
        ['forms.company']: companyForm.id,
        ['forms.applicants']: applicantsIds,
        ['forms.owners']: ownersIds,
        name: companyForm.companyName,
      });

      company.answersCount = answerCount;
      company.reqFieldsCount = this.calculateReqFieldsCount(company);
    } else {
      await this.companyFormService.updateCompanyForm(
        sanitized.company,
        companyFormId,
        company['id'],
      );

      const participantPromises = sanitized.participants.map(
        async (participant) => {
          const existParticipant =
            await this.participantFormService.findParticipantFormByDocDataAndIds(
              participant.identificationDetails.docNumber,
              participant.identificationDetails.docType,
              [...company.forms.owners, ...company.forms.applicants],
              participant.isApplicant,
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
    }

    company.reqFieldsCount = this.calculateReqFieldsCount(company);
    await company.save();
    const user = await this.userService.getUserByEmail(sanitized.user.email);

    if (!user) {
      await this.userService.createUserFromCsvData(
        sanitized.user.email,
        sanitized.user.name,
        company['_id'] as string,
      );
    } else {
      await this.userService.addCompanyToUser(
        user['id'],
        company['_id'] as string,
      );
    }
  }

  async getCompaniesByIds(companyIds: string[]) {
    const companies = await this.companyModel.find({
      _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    return companies;
  }

  // need some changes after admin part creating
  async createNewCompany(payload: any) {
    const existCompanyForm =
      await this.companyFormService.getCompanyFormByTaxData(
        payload.taxIdNumber,
        payload.taxIdType,
      );

    if (existCompanyForm) {
      throw new ConflictException(companyResponseMsgs.companyWasCreated);
    }

    let newCompanyForm = await this.companyFormService.create(payload);
    let newCompany = new this.companyModel();
    newCompany['forms.company'] = newCompanyForm['id'];
    newCompany['reqFieldsCount'] = 9;

    await newCompany.save();

    return { message: companyResponseMsgs.companyCreated };
  }

  async deleteCompanyById(companyId: string): Promise<{ message: string }> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    if (company.forms.applicants.length) {
      const applicantForms = company.forms.applicants.map(
        async (applicant) =>
          await this.participantFormService.deleteParticipantFormById(
            applicant as unknown as string,
            true,
          ),
      );

      await Promise.all(applicantForms);
    } else if (company.forms.owners.length) {
      const ownerForms = company.forms.owners.map(
        async (owner) =>
          await this.participantFormService.deleteParticipantFormById(
            owner as unknown as string,
            false,
          ),
      );

      await Promise.all(ownerForms);
    }

    await this.userService.removeCompanyFromUser(company.user as unknown as string, companyId);
    await this.companyFormService.deleteCompanyFormById(
      company.forms.company as any,
    );

    await this.companyModel.deleteOne({ _id: companyId });

    return { message: companyResponseMsgs.companyDeleted };
  }

  async getCompanyById(companyId: string): Promise<CompanyDocument> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    return company;
  }

  async findExpiringCompanies(days: number) {
    const now = new Date();
    const threshold = moment(now).add(days, 'days').toDate(); // or `new Date(now.getTime() + days * 86400000);`

    return this.companyModel.find({
      expirationDate: { $lt: threshold }, // $lt means "less than" in MongoDB queries
    });
  }

  async getByParticipantId(
    participantId: string,
  ): Promise<[boolean, CompanyDocument]> {
    const company = await this.companyModel.findOne({
      $or: [
        { 'forms.applicants': participantId },
        { 'forms.owners': participantId },
      ],
    });

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    const isApplicant = company.forms.applicants.includes(participantId as any);

    return [isApplicant, company];
  }

  async checkUserCompanyPermission(
    user: IRequestUser,
    fieldId: string,
    fieldName: 'participantForm' | 'companyForm' | 'company',
  ): Promise<void> {
    if (user) {
      const { role, userId } = user;
      let foundCompany = null;

      if (role !== 'admin') {
        if (fieldName === 'company') {
          foundCompany = await this.companyModel.findById(fieldId);
        } else if (fieldName === 'participantForm') {
          foundCompany = await this.companyModel.findOne({
            user: userId,
            $or: [{ 'forms.applicants': fieldId }, { 'forms.owners': fieldId }],
          });
        } else if (fieldName === 'companyForm') {
          foundCompany = await this.companyModel.findOne({
            user: userId,
            'forms.company': fieldId,
          });
        }

        if (!foundCompany) {
          throw new ForbiddenException(
            `No permission for the provided ${fieldName}.`,
          );
        }
      }
    }
  }

  private calculateReqFieldsCount(company: CompanyDocument): number {
    return (
      company.forms.applicants.length * 15 +
      company.forms.owners.length * 11 +
      9
    );
  }

  async changeCompanyReqFieldsCount(
    companyId: string,
    count: number,
  ): Promise<void> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    company.reqFieldsCount += count;

    await company.save();
  }
}
