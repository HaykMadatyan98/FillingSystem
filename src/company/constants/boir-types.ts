export const BOIRCompanyForm = {
  ['activityPartyCode']: 'ActivityPartyTypeCode', // code 62
  isExistingCompany: 'ExistingReportingCompanyIndicator',
  formationJurisdiction: {
    ['stateOfFormation']: 'FormationStateCodeText',
    ['countryOrJurisdictionOfFormation']: 'FormationCountryCodeText',
    ['tribalJurisdiction']: 'FormationLocalTribalCodeText',
    ['nameOfOtherTribal']: 'OtherFormationLocalTribalText',
  },
  repCompanyInfo: {
    requestToReceiveFID: 'RequestFinCENIDIndicator',
  },
  names: {
    legalName: 'PartyName', //item5
    altName: 'PartyName', // item6
  },
};

export const BOIRUser = {
  user: {
    firstName: 'SubmitterIndivdualFirstName',
    lastName: 'SubmitterEntityIndivdualLastName',
    email: 'SubmitterElectronicAddressText',
  },
};
