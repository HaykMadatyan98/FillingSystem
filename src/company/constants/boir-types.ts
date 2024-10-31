export const BOIRCompanyForm = {
  ['activityPartyCode']: 'ActivityPartyTypeCode', // code 62
  isExistingCompany: 'ExistingReportingCompanyIndicator',
  formationJurisdiction: (isForeign: boolean) =>
    isForeign
      ? {
          ['stateOfFormation']: 'FirstRegistrationStateCodeText',
          ['countryOrJurisdictionOfFormation']: 'FormationCountryCodeText',
          ['tribalJurisdiction']: 'FirstRegistrationLocalTribalCodeText',
          ['nameOfOtherTribal']: 'OtherFirstRegistrationLocalTribalText',
        }
      : {
          ['stateOfFormation']: 'FormationStateCodeText',
          ['countryOrJurisdictionOfFormation']: 'FormationCountryCodeText',
          ['tribalJurisdiction']: 'FormationLocalTribalCodeText',
          ['nameOfOtherTribal']: 'OtherFormationLocalTribalText',
        },
  repCompanyInfo: {
    requestToReceiveFID: 'RequestFinCENIDIndicator',
  },
  names: {
    legalName: 'PartyName',
    altName: 'PartyName',
  },
  address: {

  }
};

export const BOIRUser = {
  user: {
    firstName: 'SubmitterIndivdualFirstName',
    lastName: 'SubmitterEntityIndivdualLastName',
    email: 'SubmitterElectronicAddressText',
  },
};
