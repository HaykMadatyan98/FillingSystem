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
    private companyFormModel: Model<CompanyFormDocument>,
  ) {}

  async create(createCompanyFormDto: any): Promise<CompanyForm> {
    const createdCompany = new this.companyFormModel(createCompanyFormDto);
    return createdCompany.save();
  }

  async getCompanyFormByTaxId(taxIdNumber: number) {
    const companyForm = await this.companyFormModel.findOne({
      taxIdNumber: taxIdNumber,
    });

    return companyForm;
  }

  async createCompanyFormFromCsv(companyFormData) {
    const companyData = new this.companyFormModel({
      repCompanyInfo: companyFormData.repCompanyInfo,
      names: companyFormData.names,
      formationJurisdiction: companyFormData.formationJurisdiction,
      taxInfo: companyFormData.taxInfo,
      address: companyFormData.address,
    });

    await companyData.save();
    return { id: companyData._id, companyName: companyData.names.legalName };
  }
}
