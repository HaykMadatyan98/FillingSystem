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
    const isApplicant =
      companyParticipantData.isApplicant === 'true' ? true : false;

    delete companyParticipantData.isApplicant;

    const participant = new this.participantFormModel(companyParticipantData);

    await participant.save();

    const requiredFieldsCount = await calculateRequiredFieldsCount(
      participant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
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
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
    );

    const updateDataKeys = Object.keys(participantData);
    for (const i of updateDataKeys) {
      if (i !== 'isApplicant') {
        participant[i] = { ...participant[i], ...participantData[i] };
      }
    }

    const requiredFieldsCountAfter = await calculateRequiredFieldsCount(
      participant,
      isApplicant ? requiredApplicantFields : requiredOwnerFields,
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
