import { getEnumKeyByValue } from '@/utils/validator.util';
import { AllCountryEnum, ForeignCountryEnum } from './country.enum';
import { StatesEnum } from './territory-states.enum';

export const BOIRCompanyFormParseData = {
  isExistingCompany: (value: boolean) => ({
    ExistingReportingCompanyIndicator: value ? 'Y' : 'F',
  }),
  formationJurisdiction: (isForeign: boolean) =>
    isForeign
      ? {
          stateOfFormation: (value: string) => ({
            FirstRegistrationStateCodeText: getEnumKeyByValue(
              value,
              StatesEnum,
            ),
          }),
          countryOrJurisdictionOfFormation: (value: string) => ({
            FormationCountryCodeText: getEnumKeyByValue(
              value,
              ForeignCountryEnum,
            ),
          }),
          tribalJurisdiction: (value: string) => ({
            FirstRegistrationLocalTribalCodeText: value,
          }),
          nameOfOtherTribal: (value: string) => ({
            OtherFirstRegistrationLocalTribalText: value,
          }),
        }
      : {
          stateOfFormation: (value: string) => ({
            FormationStateCodeText: getEnumKeyByValue(value, StatesEnum),
          }),
          countryOrJurisdictionOfFormation: (value: string) => ({
            FormationCountryCodeText: getEnumKeyByValue(value, AllCountryEnum),
          }),
          tribalJurisdiction: (value: string) => ({
            FormationLocalTribalCodeText: value,
          }),
          nameOfOtherTribal: (value: string) => ({
            OtherFormationLocalTribalText: value,
          }),
        },
  repCompanyInfo: {
    requestToReceiveFID: 'RequestFinCENIDIndicator',
  },
  names: {
    legalName: 'PartyName',
    altName: 'PartyName',
  },
  address: {
    // Address
    address: 'RawStreetAddress1Text',
    city: 'RawCityText',
    usOrUsTerritory: 'RawCountryCodeText',
    state: 'RawStateCodeText',
    zipCode: 'RawZIPCode',
  },
  taxInfo: {
    // PartyIdentification
    taxIdType: 'PartyIdentificationTypeCode',
    taxIdNumber: 'PartyIdentificationNumberText',
    countryOrJurisdiction: 'OtherIssuerCountryText',
  },
};

export const BOIRUseParseData = {
  user: {
    firstName: 'SubmitterIndivdualFirstName',
    lastName: 'SubmitterEntityIndivdualLastName',
    email: 'SubmitterElectronicAddressText',
  },
};
