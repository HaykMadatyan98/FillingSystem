import { IRequestUser } from '@/auth/interfaces/request.interface';
import { CompanyService } from '@/company/company.service';
import {
  countriesWithStates,
  requiredCompanyFields,
  UNITED_STATES,
} from '@/company/constants';
import { TRResponseMsg } from '@/participant-form/interfaces';
import { calculateRequiredFieldsCount } from '@/utils/req-field.util';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { companyFormFields, companyFormResponseMsgs } from './constants';
import {
  IChangeCompanyForm,
  ICompanyForm,
} from './interfaces/company-form.interface';
import {
  CompanyForm,
  CompanyFormDocument,
} from './schemas/company-form.schema';

@Injectable()
export class CompanyFormService {
  constructor(
    @InjectModel(CompanyForm.name)
    private companyFormModel: Model<CompanyFormDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async createCompanyFormFromCsv(companyFormData: ICompanyForm) {
    const companyData = new this.companyFormModel({ ...companyFormData });
    const answerCount = await calculateRequiredFieldsCount(
      companyFormData,
      requiredCompanyFields,
    );

    companyData.answerCount = answerCount;

    await companyData.save();
    const missingFormData = await this.getCompanyFormMissingFields(companyData);
    return {
      id: companyData._id,
      companyName: companyData.names.legalName,
      answerCount,
      missingFormData,
    };
  }

  async updateCompanyForm(
    companyFormData: IChangeCompanyForm,
    companyFormDataId: string,
    companyId: string,
    user?: IRequestUser | boolean,
    missingCompanyForm?: any,
  ): TRResponseMsg {
    if (user && typeof user !== 'boolean') {
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

    let existingStatusChanged = false;
    if (typeof companyFormData.isExistingCompany !== 'undefined') {
      existingStatusChanged =
        await this.companyService.changeExistingCompanyStatus(
          companyId,
          companyFormData.isExistingCompany,
        );
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
    await this.companyService.changeCompanyReqFieldsCount(
      companyId,
      countDiff,
      existingStatusChanged,
    );

    if (missingCompanyForm) {
      const missingCompanyData =
        await this.getCompanyFormMissingFields(companyData);
      if (missingCompanyData.length) {
        missingCompanyForm.company = missingCompanyData;
      }
    }

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

  async getCompanyFormMissingFields(companyForm: CompanyFormDocument) {
    const topLevelKeys = Object.keys(companyFormFields);
    const missingFields: string[] = [];

    topLevelKeys.forEach((topLevelKey) => {
      if (companyForm[topLevelKey]) {
        if (
          typeof companyForm[topLevelKey] !== 'string' ||
          typeof companyForm[topLevelKey] !== 'boolean'
        ) {
          Object.keys(companyFormFields[topLevelKey]).forEach((lowLevelKey) => {
            if (
              companyForm[topLevelKey][lowLevelKey] === '' ||
              companyForm[topLevelKey][lowLevelKey] === undefined ||
              companyForm[topLevelKey][lowLevelKey] === null
            ) {
              if (topLevelKey === 'taxInfo') {
                if (lowLevelKey === 'countryOrJurisdiction') {
                  if (companyForm[topLevelKey]['taxIdType'] === 'Foreign') {
                    missingFields.push(
                      companyFormFields[topLevelKey][lowLevelKey],
                    );
                  }
                } else {
                  missingFields.push(
                    companyFormFields[topLevelKey][lowLevelKey],
                  );
                }
              } else if (topLevelKey === 'formationJurisdiction') {
                if (lowLevelKey === 'countryOrJurisdictionOfFormation') {
                  missingFields.push(
                    companyFormFields[topLevelKey][lowLevelKey],
                  );
                } else if (lowLevelKey === 'stateOfFormation') {
                  if (
                    countriesWithStates.includes(
                      companyForm[topLevelKey][
                        'countryOrJurisdictionOfFormation'
                      ],
                    ) &&
                    companyForm[topLevelKey][
                      'countryOrJurisdictionOfFormation'
                    ] === UNITED_STATES
                  ) {
                    missingFields.push(
                      companyFormFields[topLevelKey][lowLevelKey],
                    );
                  }
                } else if (
                  lowLevelKey === 'tribalJurisdiction' &&
                  companyForm[topLevelKey][
                    'countryOrJurisdictionOfFormation'
                  ] === UNITED_STATES
                ) {
                  missingFields.push(
                    companyFormFields[topLevelKey][lowLevelKey],
                  );
                } else if (
                  lowLevelKey === 'nameOfOtherTribal' &&
                  companyForm[topLevelKey]['tribalJurisdiction'] === 'Other'
                ) {
                  missingFields.push(
                    companyFormFields[topLevelKey][lowLevelKey],
                  );
                }
              } else {
                missingFields.push(companyFormFields[topLevelKey][lowLevelKey]);
              }
            }
          });
        } else {
          missingFields.push(companyFormFields[topLevelKey]);
        }
      }
    });

    return missingFields;
  }
}
