export interface ISanitizedData {
  user: ICsvUser;
  company: ICompanyData;
  participants: IParticipantData[];
  BOIRExpTime: Date;
}

export interface ICsvUser {
  email: string;
  firstName: string;
  lastName: string;
}
export interface ICompanyData {
  names?: {
    legalName?: string;
    altName?: string[];
  };
  taxInfo: {
    taxIdType: string;
    taxIdNumber: number;
    countryOrJurisdiction?: string;
  };
  formationJurisdiction?: {
    countryOrJurisdictionOfFormation: string;
  };
  address?: IAddress;
  repCompanyInfo?: IRepCompanyInfo;
  isExistingCompany: boolean;
}

interface IRepCompanyInfo {
  requestToReceiveFID?: boolean;
  foreignPooled?: boolean;
}

export interface IParticipantData {
  isApplicant: boolean;
  finCENID?: {
    finCENID: string;
  };
  personalInfo?: IPersonalInfo;
  address?: IAddress;
  identificationDetails: IIdentificationDetails;
  beneficialOwner?: IBeneficialOwner;
  exemptEntity?: IExemptEntity;
}

interface IPersonalInfo {
  lastOrLegalName?: string;
  firstName?: string;
  middleName?: string;
  suffix?: string;
  dateOfBirth?: Date;
}

interface IAddress {
  type?: string;
  address?: string;
  city?: string;
  countryOrJurisdiction?: string;
  state?: string;
  postalCode?: string;
}

interface IIdentificationDetails {
  docType: string;
  docNumber: string;
  countryOrJurisdiction?: string;
  state?: string;
  localOrTribal?: string;
  otherLocalOrTribalDesc?: string;
  docImg?: string;
}

interface IBeneficialOwner {
  isParentOrGuard: boolean;
}

interface IExemptEntity {
  isExemptEntity: boolean;
}
