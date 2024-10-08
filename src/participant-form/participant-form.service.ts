import {
  TRChangeParticipantForm,
  TRCreateParticipantByCSV,
  TRResponseMsg,
} from './interfaces/participant-service.interface';
import { participantFormResponseMsgs } from './constants/participant-form.response-messages';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApplicantForm,
  ApplicantFormDocument,
  OwnerForm,
  OwnerFormDocument,
} from './schemas/participant-form.schema';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import {
  requiredApplicantFields,
  requiredOwnerFields,
} from '@/company/constants';
import { CompanyService } from '@/company/company.service';
import { IRequestUser } from '@/auth/interfaces/request.interface';
import { companyFormResponseMsgs } from '@/company-form/constants';

@Injectable()
export class ParticipantFormService {
  constructor(
    @InjectModel(OwnerForm.name)
    private ownerFormModel: Model<OwnerFormDocument>,
    @InjectModel(ApplicantForm.name)
    private applicantFormModel: Model<ApplicantFormDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async createParticipantFormFromCsv(
    companyParticipantData: any,
  ): TRCreateParticipantByCSV {
    const isApplicant = companyParticipantData.isApplicant;

    delete companyParticipantData.isApplicant;

    const participant = isApplicant
      ? new this.applicantFormModel(companyParticipantData)
      : new this.ownerFormModel(companyParticipantData);

    const requiredFieldsCount = await calculateRequiredFieldsCount(
      participant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
    );

    participant.answerCount = requiredFieldsCount;
    await participant.save();

    return [isApplicant, participant.id as string, requiredFieldsCount];
  }

  async changeParticipantForm(
    participantData: any,
    participantFormId: any,
    isApplicant: boolean,
    companyId: string,
    user?: IRequestUser,
  ): Promise<any> {
    if (user) {
      await this.companyService.checkUserCompanyPermission(
        user,
        participantFormId,
        'participantForm',
      );
    }

    const participant: any = isApplicant
      ? await this.applicantFormModel.findById(participantFormId)
      : await this.ownerFormModel.findById(participantFormId);

    const requiredFieldsCountBefore = await calculateRequiredFieldsCount(
      participant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
    );

    const updateDataKeys = Object.keys(participantData);
    for (const i of updateDataKeys) {
      participant[i] = { ...participant[i], ...participantData[i] };
    }

    const requiredFieldsCountAfter = await calculateRequiredFieldsCount(
      participant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
    );

    const countDifference =
      requiredFieldsCountBefore - requiredFieldsCountAfter;
    participant.answerCount += countDifference;

    await this.companyService.changeCompanyReqFieldsCount(
      companyId,
      countDifference,
    );

    await participant.save();
    return { participant, message: 'participant changed' };
  }

  async findParticipantFormByDocDataAndIds(
    docNum: string,
    docType: string,
    ids: any,
    isApplicant: boolean,
  ) {
    const participantForm = isApplicant
      ? await this.applicantFormModel.findOne({
          'identificationDetails.docNumber': docNum,
          'identificationDetails.docType': docType,
          _id: { $in: ids },
        })
      : await this.ownerFormModel.findOne({
          'identificationDetails.docNumber': docNum,
          'identificationDetails.docType': docType,
          _id: { $in: ids },
        });

    return participantForm;
  }

  async createParticipantForm(
    payload: any,
    companyId: string,
    isApplicant: boolean,
    user: IRequestUser,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      companyId,
      'company',
    );

    // add calculation of answers

    const company = await this.companyService.getCompanyById(companyId);
    const createdParticipant = isApplicant
      ? await this.applicantFormModel.create({
          ...payload,
        })
      : await this.ownerFormModel.create({ ...payload });

    company.forms[`${isApplicant ? 'applicants' : 'owners'}`].push(
      createdParticipant['id'],
    );

    await company.save();
  }

  async getParticipantFormById(
    participantFormId: string,
    isApplicant: boolean,
    user: IRequestUser,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      participantFormId,
      'participantForm',
    );

    const participantForm = isApplicant
      ? await this.applicantFormModel.findById(participantFormId)
      : await this.ownerFormModel.findById(participantFormId);

    if (!participantForm) {
      throw new NotFoundException(companyFormResponseMsgs.companyFormNotFound);
    }

    return participantForm;
  }

  async deleteParticipantFormById(
    participantFormId: string,
    isApplicant: boolean,
    user?: IRequestUser,
  ): TRResponseMsg {
    if (user) {
      await this.companyService.checkUserCompanyPermission(
        user,
        participantFormId,
        'participantForm',
      );
    }

    const participantForm = isApplicant
      ? await this.applicantFormModel.findByIdAndDelete(participantFormId)
      : await this.ownerFormModel.findByIdAndDelete(participantFormId);

    if (!participantForm) {
      throw new NotFoundException(
        participantFormResponseMsgs.participantFormNotFound,
      );
    }

    return { message: participantFormResponseMsgs.participantDeleted };
  }

  private async uploadAnImageToTheCloud(
    file: Express.Multer.File,
  ): Promise<string> {
    // update later
    return 'exampleUrt123qww21';
  }

  async updateDocImageInParticipantForm(
    participantId: string,
    docImg: Express.Multer.File,
    user: any,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      participantId,
      'participantForm',
    );

    const [isApllicant, company] =
      await this.companyService.getByParticipantId(participantId);

    const docImgUrl = await this.uploadAnImageToTheCloud(docImg);

    await this.changeParticipantForm(
      { identificationDetails: { docImgUrl } },
      participantId,
      isApllicant,
      company['id'],
    );

    return { message: participantFormResponseMsgs.participantChanged };
  }

  async uploadAnImageAndCreate(
    companyId: string,
    docImg: Express.Multer.File,
    payload: { isApplicant: boolean; docNum: string; docType: string },
    isApplicant: boolean,
    user: IRequestUser,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      companyId,
      'company',
    );

    const { docNum, docType } = payload;
    const company = await this.companyService.getCompanyById(companyId);
    const docImgUrl = await this.uploadAnImageToTheCloud(docImg);
    const createdParticipant = isApplicant
      ? await this.applicantFormModel.create({
          identificationDetails: { docNum, docType, docImg: docImgUrl },
        })
      : await this.applicantFormModel.create({
          identificationDetails: { docNum, docType, docImg: docImgUrl },
        });

    company.forms[`${isApplicant ? 'applicants' : 'owners'}`].push(
      createdParticipant['id'],
    );

    await company.save();

    return {
      message: participantFormResponseMsgs.participantCreated,
      participantId: createdParticipant['id'],
    };
  }

  async getAllCompaniesParticipants(isApplicant: boolean, userId: string) {
    const userParticipantsIds =
      await this.companyService.getUserCompaniesParticipants(
        userId,
        isApplicant,
      );

    const allParticipants = await Promise.all(
      userParticipantsIds.map(async (participantId) => {
        const participant = isApplicant
          ? await this.applicantFormModel.findById(participantId, {
              id: 1,
              answerCount: 1,
              personalInfo: 1,
            })
          : await this.ownerFormModel.findById(participantId, {
              id: 1,
              answerCount: 1,
              personalInfo: 1,
            });

        return {
          id: participant['id'],
          fullName:
            participant.personalInfo.firstName +
            ' ' +
            participant.personalInfo.lastOrLegalName,
          percentage:
            (isApplicant
              ? participant.answerCount / 15
              : participant.answerCount / 11) * 100,
        };
      }),
    );

    return { message: 'Participants retrieved successfully', allParticipants };
  }
}
