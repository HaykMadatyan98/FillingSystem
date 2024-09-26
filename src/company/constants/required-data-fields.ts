export const requiredCompanyFields = [
  'names.legalName',
  'taxInfo.taxIdType',
  'taxInfo.taxIdNumber',
  'formationJurisdiction.countryOrJurisdictionOfFormation',
  'address.address',
  'address.city',
  'address.usOrUsTerritory',
  'address.state',
  'address.zipCode',
];

export const requiredOwnerFields = [
  'address.address',
  'address.countryOrJurisdiction',
  'address.state',
  'address.postalCode',
  'identificationDetails.docType',
  'identificationDetails.docNumber',
  'identificationDetails.countryOrJurisdiction',
  'identificationDetails.state',
  'identificationDetails.localOrTribal',
  'identificationDetails.otherLocalOrTribalDesc',
  'identificationDetails.docImg',
];

export const requiredApplicantFields = [
  ...requiredOwnerFields,
  'personalInfo.lastOrLegalName',
  'personalInfo.firstName',
  'personalInfo.dateOfBirth',
  'address.type',
];

export const requiredApplicantFieldsForBusiness = [
  'address.business_address',
  'address.business_countryOrJurisdiction',
  'address.business_state',
  'address.business_postalCode',
  'identificationDetails.docType',
  'identificationDetails.docNumber',
  'identificationDetails.countryOrJurisdiction',
  'identificationDetails.state',
  'identificationDetails.localOrTribal',
  'identificationDetails.otherLocalOrTribalDesc',
  'identificationDetails.docImg',
  'personalInfo.lastOrLegalName',
  'personalInfo.firstName',
  'personalInfo.dateOfBirth',
  'address.type',
];
