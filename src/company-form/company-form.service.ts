import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompanyForm,
  CompanyFormDocument,
} from './schemas/company-form.schema';
import { ICompanyForm } from './interfaces/company-form.interface';

@Injectable()
export class CompanyFormService {
  constructor(
    @InjectModel(CompanyForm.name)
    private companyFormModel: Model<CompanyFormDocument>,
  ) {}

  async create(companyFormData: ICompanyForm): Promise<CompanyForm> {
    const companyForm = new this.companyFormModel(companyFormData);
    return companyForm.save();
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

  async createCompanyFormFromCsv(companyFormData: ICompanyForm) {
    const companyData = new this.companyFormModel({ ...companyFormData });

    await companyData.save();
    return { id: companyData._id, companyName: companyData.names.legalName };
  }

  async updateCompanyFormFromCsv(
    companyFormData: ICompanyForm,
    companyFormDataId: string,
  ) {
    const companyData = await this.companyFormModel.findById(companyFormDataId);

    const updateDataKeys = Object.keys(companyFormData);
    for (const i of updateDataKeys) {
      companyData[i] = { ...companyData[i], ...companyFormData[i] };
    }

    await companyData.save();
    return { id: companyData._id, companyName: companyData.names.legalName };
  }

  async getCompanyFormById(companyFormId: string) {
    console.log(companyFormId);
    throw new NotImplementedException('Not implemented yet');
  }

  async changeCompanyFormById(companyFormId: string, payload: any) {
    console.log(companyFormId, payload);

    throw new NotImplementedException('Not implemented yet');
  }
}
