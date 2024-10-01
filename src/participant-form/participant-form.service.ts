import { participantFormResponseMsgs } from './constants/participant-form.response-messages';
import { requiredApplicantFieldsForBusiness } from './../company/constants/required-data-fields';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ParticipantForm,
  ParticipantFormDocument,
} from './schemas/participant-form.schema';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import {
  requiredApplicantFields,
  requiredOwnerFields,
} from '@/company/constants';
import { CompanyService } from '@/company/company.service';

@Injectable()
export class ParticipantFormService {
  constructor(
    @InjectModel(ParticipantForm.name)
    private participantFormModel: Model<ParticipantFormDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async createParticipantFormFromCsv(
    companyParticipantData: any,
  ): Promise<any> {
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

    const participant = new this.participantFormModel(companyParticipantData);

    await participant.save();

    const requiredFieldsCount = await calculateRequiredFieldsCount(
      participant,
      isApplicant
        ? participant['address']['type'] === 'business'
          ? requiredApplicantFieldsForBusiness
          : requiredApplicantFields
        : requiredOwnerFields,
    );

    return [isApplicant, participant.id, requiredFieldsCount];
  }

  async changeParticipantForm(
    participantData: any,
    participantFormId: any,
    isApplicant: boolean,
  ): Promise<{ id: unknown; answerCountDifference: number }> {
    const participant =
      await this.participantFormModel.findById(participantFormId);

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
    file?: Express.Multer.File,
  ) {
    const isApplicant = payload.isApplicant;
    delete payload.isApplicant;

    if (file) {
      console.log(file, 'file');
      // add to azur, get image id and set in identificationDetails.docImg:
    }

    const updatedParticipant = await this.changeParticipantForm(
      payload,
      formId,
      isApplicant,
    );

    await this.companyService.recalculateReqFields(
      companyId,
      updatedParticipant.answerCountDifference,
    );

    return { message: participantFormResponseMsgs.participantChanged };
  }

  async findParticipantFormByDocNumAndIds(docNum: string, ids: any) {
    const participantForm = await this.participantFormModel.findOne({
      'identificationDetails.docNumber': docNum,
      _id: { $in: ids },
    });

    return participantForm;
  }

  async createParticipantForm() {
    throw new NotImplementedException('not implemented yet');
  }

  async getParticipantFormById(participantFormId: string) {
    throw new NotImplementedException('not implemented yet');
  }

  async deleteParticipantFormById(
    participantFormId: string,
  ): Promise<{ message: string }> {
    const participantForm =
      await this.participantFormModel.findByIdAndDelete(participantFormId);

    if (!participantForm) {
      throw new NotFoundException(
        participantFormResponseMsgs.participantFormNotFound,
      );
    }

    return { message: participantFormResponseMsgs.participantDeleted };
  }

  async uploadAnImageToTheCloud(file: Express.Multer.File): Promise<string> {
    // update later
    return 'exampleUrt123qww21';
  }

  async updateDocImageInParticipantForm(
    participantId: string,
    docImg: Express.Multer.File,
  ) {
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
  ) {
    const { isApplicant, docNum, docType } = payload;
    const company = await this.companyService.getCompanyById(companyId);
    const docImgUrl = await this.uploadAnImageToTheCloud(docImg);
    const createdParticipant = await this.participantFormModel.create({
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
