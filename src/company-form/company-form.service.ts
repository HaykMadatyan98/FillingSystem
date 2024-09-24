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

  async getCompanyFormIdByTaxId(taxIdNumber: number) {
    const companyForm = await this.companyFormModel.findOne(
      {
        taxIdNumber: taxIdNumber,
      },
      { id: 1 },
    );

    return companyForm ? companyForm.id : companyForm;
  }

  // add interface
  async createCompanyFormFromCsv(companyFormData: any) {
    const companyData = new this.companyFormModel({ ...companyFormData });

    await companyData.save();
    return { id: companyData._id, companyName: companyData.names.legalName };
  }

  // add interface
  async updateCompanyFormFromCsv(companyFormData: any, companyFormDataId: any) {
    let companyData = await this.companyFormModel.findById(companyFormDataId);

    const updateDataKeys = Object.keys(companyFormData);
    for (let i of updateDataKeys) {
      companyData[i] = { ...companyData[i], ...companyFormData[i] };
    }

    await companyData.save();
    return { id: companyData._id, companyName: companyData.names.legalName };
  }
}
