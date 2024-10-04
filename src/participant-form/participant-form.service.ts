import {
  TRChangeParticipantForm,
  TRCreateParticipantByCSV,
  TRResponseMsg,
} from './interfaces/participant-service.interface';
import { participantFormResponseMsgs } from './constants/participant-form.response-messages';
import { requiredApplicantFieldsForBusiness } from './../company/constants/required-data-fields';
import {
  BadRequestException,
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
import { ICreateParticipantForm } from './interfaces/participant-from.interface';
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

    if (
      isApplicant &&
      companyParticipantData['address']['type'] === 'business'
    ) {
      const addressValues = Object.entries(companyParticipantData['address']);
      addressValues.map(([key, value]) => {
        if (key !== 'type') {
          companyParticipantData['address']['business_' + key] = value;
          delete companyParticipantData['address'][key];
        }
      });
    }

    const participant = isApplicant
      ? new this.applicantFormModel(companyParticipantData)
      : new this.ownerFormModel(companyParticipantData);

    await participant.save();

    const requiredFieldsCount = await calculateRequiredFieldsCount(
      participant,
      isApplicant
        ? participant['address']['type'] === 'business'
          ? requiredApplicantFieldsForBusiness
          : requiredApplicantFields
        : requiredOwnerFields,
    );

    return [isApplicant, participant.id as string, requiredFieldsCount];
  }

  async changeParticipantForm(
    participantData: any,
    participantFormId: any,
    isApplicant: boolean,
  ): TRChangeParticipantForm {
    const participant: any = isApplicant
      ? await this.applicantFormModel.findById(participantFormId)
      : await this.ownerFormModel.findById(participantFormId);

    if (isApplicant && participantData.address) {
      if (!participant.address.type) {
        throw new BadRequestException(
          'for editing this part need to enter address type',
        );
      }
    }

    const requiredFieldsCountBefore = await calculateRequiredFieldsCount(
      participant,
      isApplicant
        ? participant['address']['type'] === 'business'
          ? requiredApplicantFieldsForBusiness
          : requiredApplicantFields
        : requiredOwnerFields,
    );
    const updateDataKeys = Object.keys(participantData);
    for (const i of updateDataKeys) {
      if (
        isApplicant &&
        i === 'address' &&
        participantData[i]['type'] === 'business'
      ) {
        const addressValues = Object.entries(participantData[i]);
        const businessAddressData = addressValues.map(([key, value]) => {
          if (key !== 'type') {
            participant[i]['business_' + key] = value;
            delete participant[i][key];
          }
        });

        participant[i] = { ...participant[i], ...businessAddressData };
      } else if (i !== 'isApplicant') {
        participant[i] = { ...participant[i], ...participantData[i] };
      }
    }

    const requiredFieldsCountAfter = await calculateRequiredFieldsCount(
      participant,
      isApplicant
        ? participant['address']['type'] === 'business'
          ? requiredApplicantFieldsForBusiness
          : requiredApplicantFields
        : requiredOwnerFields,
    );

    await participant.save();
    return {
      id: participant._id,
      answerCountDifference:
        requiredFieldsCountBefore - requiredFieldsCountAfter,
    };
  }

  async changeParticipantFormById(
    companyId: string,
    formId: string,
    payload: any,
    isApplicant: boolean,
    user: IRequestUser,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      companyId,
      'company',
    );

    const updatedParticipant = await this.changeParticipantForm(
      payload,
      formId,
      isApplicant,
    );

    await this.companyService.changeCompanyReqFieldsCount(
      companyId,
      updatedParticipant.answerCountDifference,
    );

    return { message: participantFormResponseMsgs.participantChanged };
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

    if (payload.address) {
      if (!payload.address.type) {
        throw new BadRequestException(
          'for editing this part need to enter address type',
        );
      }
    }

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

    const updatedParticipant = await this.changeParticipantForm(
      { identificationDetails: { docImgUrl } },
      participantId,
      isApllicant,
    );

    company.answersCount += updatedParticipant.answerCountDifference;
    await company.save();

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
}
