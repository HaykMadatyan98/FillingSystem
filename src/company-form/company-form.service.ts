import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompanyForm,
  CompanyFormDocument,
} from './schemas/company-form.schema';
import {
  IChangeCompanyForm,
  ICompanyForm,
} from './interfaces/company-form.interface';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import { requiredCompanyFields } from '@/company/constants';
import { companyFormResponseMsgs } from './constants';
import { CompanyService } from '@/company/company.service';
import { IRequestUser } from '@/auth/interfaces/request.interface';
import { TRResponseMsg } from '@/participant-form/interfaces';

@Injectable()
export class CompanyFormService {
  constructor(
    @InjectModel(CompanyForm.name)
    private companyFormModel: Model<CompanyFormDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async create(companyFormData: ICompanyForm): Promise<CompanyForm> {
    const companyForm = new this.companyFormModel(companyFormData);
    return companyForm.save();
  }

  async createCompanyFormFromCsv(companyFormData: ICompanyForm) {
    const companyData = new this.companyFormModel({ ...companyFormData });
    const answerCount = await calculateRequiredFieldsCount(
      companyFormData,
      requiredCompanyFields,
    );

    companyData.answerCount = answerCount;

    await companyData.save();
    return {
      id: companyData._id,
      companyName: companyData.names.legalName,
      answerCount,
    };
  }

  async updateCompanyForm(
    companyFormData: ICompanyForm | IChangeCompanyForm,
    companyFormDataId: string,
    companyId: string,
    user?: IRequestUser,
  ): TRResponseMsg {
    if (user) {
      await this.companyService.checkUserCompanyPermission(
        user,
        companyId,
        'company',
      );
    }

    const companyData = await this.companyFormModel.findById(companyFormDataId);

    if (companyFormData.taxInfo) {
      if (
        companyFormData.taxInfo.taxIdType !== 'Foreign' &&
        companyFormData.taxInfo.countryOrJurisdiction
      ) {
        throw new ConflictException(
          companyFormResponseMsgs.companyFormForeignTaxIdError,
        );
      }
    }

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

    const countDiff = answerCountBefore - answerCountAfter;
    companyData.answerCount += countDiff;
    await companyData.save();
    await this.companyService.changeCompanyReqFieldsCount(companyId, countDiff);
    return {
      message: companyFormResponseMsgs.companyFormUpdated,
    };
  }

  async getCompanyFormById(
    companyFormId: string,
    user: IRequestUser,
  ): Promise<CompanyFormDocument> {
    const companyForm = await this.companyFormModel.findById(companyFormId);

    if (!companyForm) {
      throw new NotFoundException(companyFormResponseMsgs.companyFormNotFound);
    }

    await this.companyService.checkUserCompanyPermission(
      user,
      companyForm['id'],
      'companyForm',
    );

    return companyForm;
  }

  async deleteCompanyFormById(companyFormId: string) {
    const companyForm =
      await this.companyFormModel.findByIdAndDelete(companyFormId);

    if (!companyForm) {
      throw new NotFoundException(companyFormResponseMsgs.companyFormNotFound);
    }

    return { message: companyFormResponseMsgs.companyFormDeleted };
  }

  async getCompanyFormByTaxData(
    taxNumber: number,
    taxType: string,
  ): Promise<CompanyFormDocument> | null {
    return this.companyFormModel.findOne({
      'taxInfo.taxIdNumber': taxNumber,
      'taxInfo.taxIdType': taxType,
    });
  }

  async changeCompanyPaidStatus() {
    
  }
}
