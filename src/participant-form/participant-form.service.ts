import { Injectable } from '@nestjs/common';
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
    let participant =
      await this.participantFormModel.findById(participantFormId);

    const updateDataKeys = Object.keys(participantData);
    for (let i of updateDataKeys) {
      participant[i] = { ...participant[i], ...participantData[i] };
    }

    await participant.save();
    return { id: participant._id };
  }

  async findParticipantFormByDocNum(docNum: string) {
    let participantForm = await this.participantFormModel.findOne({
      ['identificationDetails.docNum']: docNum,
    });

    return participantForm;
  }
}
