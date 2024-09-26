import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ParticipantForm,
  ParticipantFormDocument,
} from './schemas/participant-form.schema';

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
    return isApplicant ? [true, participant.id] : [false, participant.id];
  }

  async changeParticipantForm(participantData: any, participantFormId: any) {
    const participant =
      await this.participantFormModel.findById(participantFormId);

    const updateDataKeys = Object.keys(participantData);
    for (const i of updateDataKeys) {
      if (i !== 'isApplicant') {
        participant[i] = { ...participant[i], ...participantData[i] };
      }
    }

    await participant.save();
    return { id: participant._id };
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

  async deleteParticipantFormById(participantFormId: string) {
    throw new NotImplementedException('not implemented yet');
  }
}
