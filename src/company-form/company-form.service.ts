import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompanyForm,
  CompanyFormDocument,
} from './schemas/company-form.schema';

@Injectable()
export class CompanyFormService {
  constructor(
    @InjectModel(CompanyForm.name)
    private reportingCompanyModel: Model<CompanyFormDocument>,
  ) {}

  async create(createCompanyFormDto: any): Promise<CompanyForm> {
    const createdCompany = new this.reportingCompanyModel(createCompanyFormDto);
    return createdCompany.save();
  }
}
