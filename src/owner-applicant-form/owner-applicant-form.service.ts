import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApplicantForm,
  OwnerForm,
  ApplicantFormDocument,
  OwnerFormDocument,
} from './schemas/owner-applicant-form.schema';

@Injectable()
export class OwnerApplicantFormService {
  constructor(
    @InjectModel(ApplicantForm.name)
    private applicantFormModel: Model<ApplicantFormDocument>,

    @InjectModel(OwnerForm.name)
    private ownerFormModel: Model<OwnerFormDocument>,
  ) {}

  async create(createCompanyApplicantDto: any): Promise<ApplicantForm> {
    const createdApplicant = new this.applicantFormModel(
      createCompanyApplicantDto,
    );
    return createdApplicant.save();
  }
}
