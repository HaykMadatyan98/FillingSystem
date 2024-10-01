import { CountryEnum, DocumentTypeEnum, StatesEnum } from '@/company/constants';

export interface IChangeParticipantForm {
  applicant?: {
    isExistingCompany?: boolean;
  };
  beneficialOwner?: {
    isParentOrGuard?: boolean;
  };
  finCENID?: {
    finCENID?: string;
  };
  exemptEntity?: {
    isExemptEntity?: boolean;
  };
  personalInfo?: {
    lastOrLegalName?: string;
    firstName?: string;
    middleName?: string;
    suffix?: string;
    dateOfBirth?: Date;
  };
  address?: {
    type?: 'business' | 'residential';
    address?: string;
    city?: string;
    countryOrJurisdiction?: CountryEnum;
    state?: StatesEnum;
    postalCode?: string;
  };
  identificationDetails?: {
    docType?: string;
    docNumber?: string;
    countryOrJurisdiction?: string;
    state?: StatesEnum;
    localOrTribal?: string;
    otherLocalOrTribalDesc?: string;
  };
}
