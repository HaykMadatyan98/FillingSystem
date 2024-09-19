import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompanyApplicant,
  CompanyApplicantDocument,
} from './schemas/company-applicant.schema';

@Injectable()
export class CompanyApplicantService {
  constructor(
    @InjectModel(CompanyApplicant.name)
    private companyApplicantModel: Model<CompanyApplicantDocument>,
  ) {}

  async create(createCompanyApplicantDto: any): Promise<CompanyApplicant> {
    const createdApplicant = new this.companyApplicantModel(
      createCompanyApplicantDto,
    );
    return createdApplicant.save();
  }
}
