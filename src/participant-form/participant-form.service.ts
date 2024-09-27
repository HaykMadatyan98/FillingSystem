import { requiredApplicantFieldsForBusiness } from './../company/constants/required-data-fields';
import { Injectable, NotImplementedException } from '@nestjs/common';
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

@Injectable()
export class ParticipantFormService {
  constructor(
    @InjectModel(ParticipantForm.name)
    private participantFormModel: Model<ParticipantFormDocument>,
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
  ) {
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
    console.log(participantFormId);
    throw new NotImplementedException('not implemented yet');
  }

  async deleteParticipantFormById(participantFormId: string) {
    console.log(participantFormId);
    throw new NotImplementedException('not implemented yet');
  }
}
