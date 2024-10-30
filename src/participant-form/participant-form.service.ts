import { IRequestUser } from '@/auth/interfaces/request.interface';
import { AzureService } from '@/azure/azure.service';
import { companyFormResponseMsgs } from '@/company-form/constants';
import { CompanyService } from '@/company/company.service';
import {
  countriesWithStates,
  requiredApplicantFields,
  requiredOwnerFields,
  UNITED_STATES,
} from '@/company/constants';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  applicantFormFields,
  ownerFormFields,
  participantFormResponseMsgs,
} from './constants';
import {
  TRCreateParticipantByCSV,
  TRResponseMsg,
} from './interfaces/participant-service.interface';
import {
  ApplicantForm,
  ApplicantFormDocument,
  OwnerForm,
  OwnerFormDocument,
} from './schemas/participant-form.schema';

@Injectable()
export class ParticipantFormService {
  constructor(
    @InjectModel(OwnerForm.name)
    private ownerFormModel: Model<OwnerFormDocument>,
    @InjectModel(ApplicantForm.name)
    private applicantFormModel: Model<ApplicantFormDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
    private readonly azureService: AzureService,
  ) {}

  async createParticipantFormFromCsv(
    companyParticipantData: any,
    missingFields: any,
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

    if (!missingFields[isApplicant ? 'applicants' : 'owners']) {
      missingFields[isApplicant ? 'applicants' : 'owners'] = [
        await this.getParticipantFormMissingFields(participant, isApplicant),
      ];
    } else {
      missingFields[isApplicant ? 'applicants' : 'owners'].push(
        await this.getParticipantFormMissingFields(participant, isApplicant),
      );
    }

    return [isApplicant, participant.id as string, requiredFieldsCount];
  }

  async changeParticipantForm(
    participantData: any,
    participantFormId: string,
    isApplicant: boolean,
    companyId: string,
    user?: IRequestUser | boolean,
    missingFields?: any,
  ): Promise<any> {
    if (user && typeof user !== 'boolean') {
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

    if (
      participantData.identificationDetails &&
      participantData.identificationDetails.docImg &&
      participant.identificationDetails.docImg
    ) {
      await this.azureService.delete(participant.identificationDetails.docImg);
    }

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

    if (missingFields) {
      if (!missingFields[isApplicant ? 'applicants' : 'owners']) {
        missingFields[isApplicant ? 'applicants' : 'owners'] = [
          await this.getParticipantFormMissingFields(participant, isApplicant),
        ];
      } else {
        missingFields[isApplicant ? 'applicants' : 'owners'].push(
          await this.getParticipantFormMissingFields(participant, isApplicant),
        );
      }
    }

    return {
      participant,
      message: participantFormResponseMsgs.changed,
    };
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

    const company = await this.companyService.getCompanyById(companyId);
    const createdParticipant = isApplicant
      ? await this.applicantFormModel.create({
          ...payload,
        })
      : await this.ownerFormModel.create({ ...payload });

    company.forms[`${isApplicant ? 'applicants' : 'owners'}`].push(
      createdParticipant['id'],
    );

    const answerCount = await calculateRequiredFieldsCount(
      createdParticipant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
    );

    createdParticipant.answerCount = answerCount;

    await createdParticipant.save();
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

    return {
      participantForm,
      message: participantFormResponseMsgs.retrieved,
    };
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
      ? await this.applicantFormModel.findById(participantFormId)
      : await this.ownerFormModel.findById(participantFormId);

    if (!participantForm) {
      throw new NotFoundException(participantFormResponseMsgs.formNotFound);
    }

    const imageName = participantForm.identificationDetails?.docImg;

    if (imageName) {
      await this.azureService.delete(imageName);
    }

    if (isApplicant) {
      await this.applicantFormModel.findByIdAndDelete(participantFormId);
    } else {
      await this.ownerFormModel.findByIdAndDelete(participantFormId);
    }

    return { message: participantFormResponseMsgs.deleted };
  }

  async updateDocImageInParticipantForm(
    participantId: string,
    docImg: Express.Multer.File,
    user: any,
    isApplicant: boolean,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      participantId,
      'participantForm',
    );

    const company = await this.companyService.getByParticipantId(
      participantId,
      isApplicant,
    );

    const docImgName = await this.azureService.uploadImage(docImg);

    await this.changeParticipantForm(
      { identificationDetails: { docImg: docImgName } },
      participantId,
      isApplicant,
      company['id'],
    );

    return { message: participantFormResponseMsgs.changed };
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
    const docImgName = await this.azureService.uploadImage(docImg);
    const createdParticipant = isApplicant
      ? await this.applicantFormModel.create({
          identificationDetails: { docNum, docType, docImg: docImgName },
        })
      : await this.applicantFormModel.create({
          identificationDetails: { docNum, docType, docImg: docImgName },
        });

    company.forms[`${isApplicant ? 'applicants' : 'owners'}`].push(
      createdParticipant['id'],
    );

    await company.save();

    return {
      message: participantFormResponseMsgs.created,
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

    return {
      message: participantFormResponseMsgs.retrieved,
      allParticipants,
    };
  }

  async getParticipantFormMissingFields(
    participantForm: ApplicantFormDocument | OwnerFormDocument,
    isApplicant: boolean,
  ) {
    const formFields = isApplicant ? applicantFormFields : ownerFormFields;
    const topLevelKeys = Object.keys(formFields);
    const missingFields: string[] = [];

    topLevelKeys.forEach((topLevelKey) => {
      if (participantForm[topLevelKey]) {
        Object.keys(formFields[topLevelKey]).forEach((lowLevelKey) => {
          if (
            participantForm[topLevelKey][lowLevelKey] === '' ||
            participantForm[topLevelKey][lowLevelKey] === undefined ||
            participantForm[topLevelKey][lowLevelKey] === null
          ) {
            if (
              topLevelKey === 'identificationDetails' &&
              (lowLevelKey !== 'docImg' || 'docNumber' || 'docType')
            ) {
              if (
                lowLevelKey === 'state' ||
                lowLevelKey === 'localOrTribal' ||
                (lowLevelKey === 'otherLocalOrTribalDesc' &&
                  participantForm[topLevelKey].countryOrJurisdiction ===
                    UNITED_STATES)
              ) {
                if (
                  (lowLevelKey === 'state' &&
                    !participantForm[topLevelKey].localOrTribal) ||
                  (lowLevelKey === 'localOrTribal' &&
                    !participantForm[topLevelKey].state) ||
                  (lowLevelKey === 'otherLocalOrTribalDesc' &&
                    participantForm[topLevelKey].localOrTribal === 'Other' &&
                    !participantForm[topLevelKey].otherLocalOrTribalDesc)
                ) {
                  missingFields.push(formFields[topLevelKey][lowLevelKey]);
                }
              } else if (
                lowLevelKey === 'state' &&
                countriesWithStates.includes(
                  participantForm[topLevelKey].countryOrJurisdiction,
                )
              ) {
                missingFields.push(formFields[topLevelKey][lowLevelKey]);
              }
            } else {
              missingFields.push(formFields[topLevelKey][lowLevelKey]);
            }
          }
        });
      }
    });

    return missingFields;
  }
}
