import { IRequestUser } from '@/auth/interfaces/request.interface';
import { CompanyFormService } from '@/company-form/company-form.service';
import { IUserInvitationEmail } from '@/mail/interfaces/mail.interface';
import { MailService } from '@/mail/mail.service';
import { ParticipantFormService } from '@/participant-form/participant-form.service';
import { UserService } from '@/user/user.service';
import { sanitizeData } from '@/utils/csv-sanitize';
import { filterApplicantAndOwnerRowData } from '@/utils/rowdata-parser';
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { parse } from 'fast-csv';
import * as moment from 'moment';
import mongoose, { Model } from 'mongoose';
import * as Stream from 'stream';
import { companyResponseMsgs } from './constants';
import { ISanitizedData } from './interfaces';
import { ICompanyCSVRowData } from './interfaces/company-csv.interface';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly participantFormService: ParticipantFormService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async getAllCompanies(): Promise<CompanyDocument[]> {
    const companies = await this.companyModel.find();
    // let selection: string;
    // if (query?.expTime) {
    //   query['expiationTime'] = query.expirationTime;
    // }

    // const companies = await this.companyModel
    //   .find()
    //   .limit(query?.size)
    //   .skip(query?.page === 0 ? query?.page : query?.size * query?.page)
    //   .populate({
    //     path: 'user',
    //     model: 'User',
    //     select: 'firstName email',
    //   })
    //   .exec();

    return companies;
  }

  async addCsvDataIntoDb(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(companyResponseMsgs.csvFileIsMissing);
    }

    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    // const results = [];
    // await new Promise((resolve, reject) => {
    //   bufferStream
    //     .pipe(csvParser({ separator: ',', quote: '"' }))
    //     .on('data', (data: []) => {
    //       console.log(data);
    //       const trimmedData = Object.fromEntries(
    //         Object.entries(data).map(([key, value]: [string, string]) => [
    //           key.trim(),
    //           value.trim(),
    //         ]),
    //       );

    //       results.push(trimmedData);
    //     })
    //     .on('end', () => resolve(results))
    //     .on('error', reject);
    // });

    const resultData: any[] = await new Promise((resolve, reject) => {
      const results: any[] = [];
      const headers: string[] = [];

      bufferStream
        .pipe(parse({ headers: false, delimiter: ',', quote: '"' }))
        .on('data', (row: string[]) => {
          if (headers.length === 0) {
            row.forEach((header) => headers.push(header.trim()));
          } else {
            const rowData: any = {};
            row.forEach((value, index) => {
              const header = headers[index].trim();
              if (!rowData[header]) {
                rowData[header] = [value.trim()];
              } else {
                rowData[header].push(value.trim());
              }
            });

            filterApplicantAndOwnerRowData(rowData);
            results.push(rowData);
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    console.log('thats a results', resultData);
    await Promise.all(
      resultData.map(async (row: ICompanyCSVRowData) => {
        const sanitizedCompanyData = await sanitizeData(row);
        await this.ParseCsvData(sanitizedCompanyData);
      }),
    );

    return companyResponseMsgs.csvUploadSuccessful;
  }

  private async ParseCsvData(sanitized: ISanitizedData) {
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

    const userEmailData: IUserInvitationEmail[] = [];

    if (!company) {
      company = await this.createNewCompanyFromCsv(sanitized, userEmailData);
    } else {
      await this.changeCompanyByCsv(
        company,
        companyFormId,
        sanitized,
        userEmailData,
      );
    }

    if (sanitized.BOIRExpTime) {
      company.expTime = sanitized.BOIRExpTime;
    }

    company.reqFieldsCount = this.calculateReqFieldsCount(company);

    const user = await this.userService.findOrCreateUser(
      sanitized.user.email || null,
      sanitized.user.firstName,
      sanitized.user.lastName,
      company['_id'] as unknown as string,
      (company.user as unknown as string) || null,
    );

    if (!company.user) {
      company.user = user['id'];
    }

    await company.save();
    await this.mailService.sendInvitationEmailToFormFillers(userEmailData);
  }

  private async createNewCompanyFromCsv(
    sanitized: ISanitizedData,
    userEmailData: any[],
  ) {
    let company = null;

    if (!sanitized.BOIRExpTime) {
      throw new BadRequestException(
        companyResponseMsgs.expirationTimeIsMissing,
      );
    }

    const isExistingCompany = sanitized.company.isExistingCompany;
    delete sanitized.company.isExistingCompany;

    const ownersIds = [];
    const applicantsIds = [];
    let answerCount = 0;

    if (!sanitized.company.names.legalName) {
      throw new BadRequestException(companyResponseMsgs.companyNameMissing);
    }

    const participantsData = await Promise.all(
      sanitized.participants.map((participant) => {
        if (
          !participant.isApplicant ||
          (participant.isApplicant && !isExistingCompany)
        ) {
          return this.participantFormService.createParticipantFormFromCsv(
            participant,
          );
        }
      }),
    );

    participantsData.forEach((participant) => {
      if (participant[0]) {
        applicantsIds.push(participant[1]);
      } else {
        ownersIds.push(participant[1]);
      }

      answerCount += participant[2];
    });

    const companyForm = await this.companyFormService.createCompanyFormFromCsv(
      sanitized.company,
    );

    answerCount += companyForm.answerCount;

    company = new this.companyModel({
      ['forms.company']: companyForm.id,
      name: companyForm.companyName,
      expTime: sanitized.BOIRExpTime,
      ['forms.owners']: ownersIds,
      ...(isExistingCompany ? {} : { ['forms.applicants']: applicantsIds }),
    });

    company.answersCount = answerCount;
    company.reqFieldsCount = this.calculateReqFieldsCount(company);
    userEmailData.push({
      companyName: company.name,
      email: sanitized.user.email,
      fullName: `${sanitized.user.firstName} ${sanitized.user.lastName}`,
      isNewCompany: true,
    });

    return company;
  }

  private async changeCompanyByCsv(
    company: CompanyDocument,
    companyFormId: string,
    sanitized: ISanitizedData,
    userEmailData: IUserInvitationEmail[],
  ) {
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
          await this.participantFormService.changeParticipantForm(
            participant,
            existParticipant['id'],
            participant['isApplicant'],
            company['id'],
          );
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

    const user = await this.userService.getUserById(
      company.user as unknown as string,
    );

    userEmailData.push({
      companyName: company.name,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      isNewCompany: false,
    });
    company.isSubmitted = false;
    await Promise.all(participantPromises);
  }

  async getCompaniesByIds(companyIds: string[]) {
    const companies = await this.companyModel.find({
      _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    return companies;
  }

  // need some changes after admin part creating
  // async createNewCompany(payload: any) {
  //   const existCompanyForm =
  //     await this.companyFormService.getCompanyFormByTaxData(
  //       payload.taxIdNumber,
  //       payload.taxIdType,
  //     );

  //   if (existCompanyForm) {
  //     throw new ConflictException(companyResponseMsgs.companyWasCreated);
  //   }

  //   const newCompanyForm = await this.companyFormService.create(payload);
  //   const newCompany = new this.companyModel();
  //   newCompany['forms.company'] = newCompanyForm['id'];
  //   newCompany['reqFieldsCount'] = 9;

  //   await newCompany.save();

  //   return { message: companyResponseMsgs.companyCreated };
  // }

  async deleteCompanyById(companyId: string): Promise<{ message: string }> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    if (company.forms.applicants && company.forms.applicants.length) {
      const applicantForms = company.forms.applicants.map(
        async (applicant) =>
          await this.participantFormService.deleteParticipantFormById(
            applicant as unknown as string,
            true,
          ),
      );

      await Promise.all(applicantForms);
    }

    if (company.forms.owners.length) {
      const ownerForms = company.forms.owners.map(
        async (owner) =>
          await this.participantFormService.deleteParticipantFormById(
            owner as unknown as string,
            false,
          ),
      );

      await Promise.all(ownerForms);
    }

    await this.userService.removeCompanyFromUser(
      company.user as unknown as string,
      companyId,
    );
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

  async findExpiringCompanies(days?: number) {
    const now = new Date();

    return this.companyModel
      .find({
        expirationDate: {
          $lt: days ? moment(now).add(days, 'days').toDate() : now,
        },
      })
      .populate('user', 'email')
      .select('name user');
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
          throw new ForbiddenException(companyResponseMsgs.dontHavePermission);
        }
      }
    }
  }

  private calculateReqFieldsCount(company: CompanyDocument): number {
    return (
      company.forms.applicants.length * 12 + company.forms.owners.length * 8 + 9
    );
  }

  async changeCompanyReqFieldsCount(
    companyId: string,
    count: number,
    existingCompanyStatusChanged?: boolean,
  ): Promise<void> {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    company.reqFieldsCount += count;

    if (
      existingCompanyStatusChanged &&
      company.forms.applicants &&
      company.forms.applicants.length
    ) {
      const isExisted = company.isExistingCompany;
      company.reqFieldsCount = isExisted
        ? 9 + company.forms.owners.length * 8
        : this.calculateReqFieldsCount(company);

      await company.populate({
        path: 'forms.company',
        select: 'answerCount -_id',
      });

      await company.populate({
        path: 'forms.applicants',
        select: 'answerCount -_id',
      });

      await company.populate({
        path: 'forms.owners',
        select: 'answerCount -_id',
      });

      let totalCount = 0;

      if (!isExisted) {
        company.forms.applicants.forEach(
          (applicant) => (totalCount += applicant.answerCount),
        );
      }
      company.forms.owners.forEach(
        (owner) => (totalCount += owner.answerCount),
      );
      totalCount += company.forms.company.answerCount;
      company.answersCount = totalCount;
    }

    if (company.isSubmitted) {
      company.isSubmitted = false;
    }

    await company.save();
  }

  async getUserCompaniesParticipants(userId: string, isApplicant: boolean) {
    const companies = await this.companyModel.find({
      user: userId,
    });

    if (!companies.length) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    const allParticipants = companies.map((company) =>
      isApplicant ? company.forms.applicants : company.forms.owners,
    );

    return allParticipants.flat();
  }

  async submitCompanyById(companyId: string) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    if (company.reqFieldsCount !== company.answersCount) {
      throw new BadRequestException(companyResponseMsgs.BOIRfieldsMissing);
    }

    company.isSubmitted = true;

    await company.save();

    return { message: companyResponseMsgs.BOIRisSubmitted };
  }

  async getSubmittedCompaniesAndTheirAmount(companyIds: string[]): Promise<{
    companiesAndTheirAmount: { name: string; amount: number }[];
    totalAmount: number;
  }> {
    const companies = await this.companyModel.find({
      _id: { $in: companyIds },
      isSubmitted: true,
      isPaid: false,
    });

    if (!companies.length) {
      throw new BadRequestException(companyResponseMsgs.companiesNotSubmitted);
    }

    const companiesAndTheirAmount: { name: string; amount: number }[] =
      companies.map((company, index) => ({
        name: company.name,
        amount: 100 * (index === 1 ? 0.75 : index > 1 ? 0.5 : 1),
      }));

    const totalAmount = companiesAndTheirAmount.reduce((sum, { amount }) => {
      return sum + amount;
    }, 0);

    return { companiesAndTheirAmount, totalAmount };
  }

  async removeCompanyTransaction(companyIds: string[], transactionId: string) {
    for (const companyId of companyIds) {
      const company = await this.companyModel.findOne({
        companyId,
        transactions: { $in: [transactionId] },
      });

      company.transactions = company.transactions.filter(
        (transaction) => transaction.toString() !== transactionId,
      );

      await company.save();
    }
  }

  async addTransactionToCompanies(companyIds: string, transactionId: string) {
    for (const companyId of companyIds) {
      const company = await this.companyModel.findById(companyId);

      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }

      if (!company.transactions.includes(transactionId as any)) {
        company.transactions.push(transactionId as any);

        await company.save();
      }
    }
  }

  async getAllCompanyData(companyId: string, user: IRequestUser) {
    await this.checkUserCompanyPermission(user, companyId, 'company');

    const company = await this.companyModel
      .findById(companyId)
      .select('name answersCount reqFieldsCount forms -_id  isExistingCompany')
      .populate({
        path: 'forms.company',
        model: 'CompanyForm',
        select: '-answerCount -_id -createdAt -updatedAt -__v',
      })
      .populate({
        path: 'forms.applicants',
        model: 'ApplicantForm',
        select: '-answerCount -applicant -_id -createdAt -updatedAt -__v',
      })
      .populate({
        path: 'forms.owners',
        model: 'OwnerForm',
        select:
          '-answerCount -exemptEntity -beneficialOwner -_id -createdAt -updatedAt -__v',
      })
      .exec();

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    return company;
  }

  async changeCompanyPaidStatus(transactionId: string): Promise<void> {
    const company = await this.companyModel.findOne({
      transactions: {
        $in: [transactionId],
      },
    });

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    company.isPaid = true;

    await company.save();
  }

  async getSubmittedCompanies(user: IRequestUser, userId: string) {
    if (user.userId !== userId) {
      if (user.role !== 'admin') {
        throw new ForbiddenException(companyResponseMsgs.dontHavePermission);
      }
    }

    const userCompanies = await this.companyModel
      .find({ user: userId, isSubmitted: true, isPaid: false })
      .select('name _id')
      .exec();

    if (!userCompanies.length) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    return userCompanies;
  }

  async changeExistingCompanyStatus(
    companyId: string,
    isExistingCompany: boolean,
  ) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException(companyResponseMsgs.companyNotFound);
    }

    if (company.isExistingCompany === isExistingCompany) {
      return false;
    }

    company.isExistingCompany = isExistingCompany;
    await company.save();

    return true;
  }
}
