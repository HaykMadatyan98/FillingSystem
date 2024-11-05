import { GovernmentService } from '@/government/government.service';
import { IRequestUser } from '@/auth/interfaces/request.interface';
import { AzureService } from '@/azure/azure.service';
import { companyFormResponseMsgs } from '@/company-form/constants';
import { CompanyService } from '@/company/company.service';
import {
  CANADA,
  countriesWithStates,
  MEXICO,
  requiredApplicantFields,
  requiredOwnerFields,
  UNITED_STATES,
} from '@/company/constants';
import { CompanyDocument } from '@/company/schemas/company.schema';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
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
    private readonly governmentService: GovernmentService,
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

    const requiredFieldsCount =
      participant.finCENID && participant.finCENID.finCENID
        ? isApplicant
          ? requiredApplicantFields.length
          : requiredOwnerFields.length
        : await calculateRequiredFieldsCount(
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

    if (!participant) {
      throw new NotFoundException('Form Not Found');
    }

    const requiredFieldsCountBefore =
      participant?.finCENID && participant.finCENID?.finCENID
        ? isApplicant
          ? requiredApplicantFields.length
          : requiredOwnerFields.length
        : await calculateRequiredFieldsCount(
            participant,
            isApplicant ? requiredApplicantFields : requiredOwnerFields,
          );

    if (
      participantData?.identificationDetails &&
      participantData?.identificationDetails.docImg &&
      participant.identificationDetails.docImg
    ) {
      await this.azureService.delete(participant.identificationDetails.docImg);
    }

    const updateDataKeys = Object.keys(participantData);
    for (const i of updateDataKeys) {
      participant[i] = { ...participant[i], ...participantData[i] };
    }

    const requiredFieldsCountAfter =
      participant?.finCENID && participant.finCENID.finCENID
        ? isApplicant
          ? requiredApplicantFields.length
          : requiredOwnerFields.length
        : await calculateRequiredFieldsCount(
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

    const answerCount =
      createdParticipant.finCENID && createdParticipant.finCENID.finCENID
        ? isApplicant
          ? requiredApplicantFields.length
          : requiredOwnerFields.length
        : await calculateRequiredFieldsCount(
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
      ? await this.applicantFormModel.findOne({ _id: participantFormId })
      : await this.ownerFormModel.findOne({ _id: participantFormId });

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
    companyId: string,
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
    const uploadInfo = await this.governmentService.sendAttachment(
      companyId,
      participantId,
      docImg,
    );
    if (uploadInfo.status === 'upload_success') {
      await this.changeParticipantForm(
        { identificationDetails: { docImg: docImgName } },
        participantId,
        isApplicant,
        company['id'],
      );
    } else {
      return { message: participantFormResponseMsgs.failed };
    }

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
            if (!participantForm['finCENID']) {
              if (
                topLevelKey === 'identificationDetails' &&
                (lowLevelKey !== 'docImg' || 'docNumber' || 'docType')
              ) {
                if (
                  lowLevelKey === 'state' ||
                  lowLevelKey === 'localOrTribal' ||
                  (lowLevelKey === 'otherLocalOrTribalDesc' &&
                    participantForm[topLevelKey].countryOrJurisdiction ===
                      UNITED_STATES) ||
                  participantForm[topLevelKey].countryOrJurisdiction ===
                    MEXICO ||
                  participantForm[topLevelKey].countryOrJurisdiction === CANADA
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
          } else if (
            !isApplicant &&
            topLevelKey === 'beneficialOwner' &&
            lowLevelKey === 'isParentOrGuard'
          ) {
            missingFields.push(formFields[topLevelKey][lowLevelKey]);
          }
        });
      }
    });

    return missingFields;
  }

  async changeForForeignPooled(
    company: CompanyDocument,
    ownerData?: any,
    isUploadedData?: boolean,
  ) {
    const currentCompanyOwners = company.forms.owners;
    company.populate({ path: 'forms.owners', model: 'OwnerForm' });
    const currentCompanyOwnersCount = currentCompanyOwners.length;

    if (!currentCompanyOwnersCount) {
      return;
    }

    let isExistingOwner = null;
    if (ownerData) {
      isExistingOwner = ownerData.finCENID
        ? await this.ownerFormModel.findOne({
            ['finCENID.finCENID']: ownerData.finCENID.finCENID,
          })
        : await this.ownerFormModel.findOne({
            ['identificationDetails.docNumber']:
              ownerData.identificationDetails.docNumber,
            ['identificationDetails.docType']:
              ownerData.identificationDetails.docType,
          });
    }

    if (!isExistingOwner) {
      while (company.forms.owners.length !== 1) {
        const owner = currentCompanyOwners.pop();
        await this.deleteParticipantFormById(owner['_id'], false);
      }
    } else {
      for (const owner of currentCompanyOwners) {
        if (owner['_id'] !== isExistingOwner['_id']) {
          await this.deleteParticipantFormById(owner['_id'], false);
        }
      }
    }

    if (!isUploadedData) {
      await company.save();
    }
  }

  async getByFinCENId(finCENId: string, isApplicant) {
    const participant = isApplicant
      ? await this.applicantFormModel.findOne({
          ['finCENID.finCENID']: finCENId,
        })
      : await this.ownerFormModel.findOne({ ['finCENID.finCENID']: finCENId });
    return participant;
  }

  async removeParticipantDocumentImage(
    participantId: string,
    user: IRequestUser,
    isApplicant: boolean,
    companyId: string,
  ) {
    await this.companyService.checkUserCompanyPermission(
      user,
      participantId,
      'participantForm',
    );

    const participant = isApplicant
      ? await this.applicantFormModel.findById(participantId)
      : await this.ownerFormModel.findById(participantId);

    if (!participant) {
      throw new NotFoundException(participantFormResponseMsgs.formNotFound);
    }

    if (!participant.identificationDetails.docImg) {
      throw new BadRequestException('current participant dont have an image');
    }

    await this.azureService.delete(participant.identificationDetails.docImg);

    if (!participant.finCENID?.finCENID) {
      await this.companyService.changeCompanyReqFieldsCount(companyId, 1);
    }

    return { message: 'image deleted' };
  }
}
