import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompanyForm,
  CompanyFormDocument,
} from './schemas/company-form.schema';
import { ICompanyForm } from './interfaces/company-form.interface';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import { requiredCompanyFields } from '@/company/constants';

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

  async getCompanyFormIdByTaxId(taxIdNumber: number): Promise<null | string> {
    const companyForm: CompanyFormDocument | null =
      await this.companyFormModel.findOne(
        {
          ['taxInfo.taxIdNumber']: taxIdNumber,
        },
        { id: 1 },
      );

    return companyForm ? (companyForm.id as string) : null;
  }

  async createCompanyFormFromCsv(companyFormData: ICompanyForm) {
    const companyData = new this.companyFormModel({ ...companyFormData });
    const answerCount = await calculateRequiredFieldsCount(
      companyFormData,
      requiredCompanyFields,
    );

    await companyData.save();
    return {
      id: companyData._id,
      companyName: companyData.names.legalName,
      answerCount,
    };
  }

  async updateCompanyFormFromCsv(
    companyFormData: ICompanyForm,
    companyFormDataId: string,
  ) {
    const companyData = await this.companyFormModel.findById(companyFormDataId);

    const answerCountBefore = await calculateRequiredFieldsCount(
      companyData,
      requiredCompanyFields,
    );

    const updateDataKeys = Object.keys(companyFormData);
    for (const i of updateDataKeys) {
      companyData[i] = { ...companyData[i], ...companyFormData[i] };
    }

    const answerCountAfter = await calculateRequiredFieldsCount(
      companyData,
      requiredCompanyFields,
    );

    await companyData.save();
    return {
      id: companyData._id,
      companyName: companyData.names.legalName,
      answerCountDiff: answerCountBefore - answerCountAfter,
    };
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
