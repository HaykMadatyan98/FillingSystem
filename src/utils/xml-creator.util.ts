import {
  AllCountryEnum,
  BOIRCompanyFormParser,
  ForeignCountryEnum,
  StatesEnum,
  TribalDataEnum,
} from '@/company/constants';
import { BOIRDateParser } from '@/company/constants/boir-types';
import { CompanyDocument } from '@/company/schemas/company.schema';
import { create } from 'xmlbuilder2';
import { getEnumKeyByValue } from './validator.util';

const addDataElement = (
  parent: any,
  elementName: string,
  data: any,
  options: any = {},
) => {
  return parent.ele(`fc2:${elementName}`, options).txt(data);
};

export const createCompanyXml = async (
  companyData: CompanyDocument,
  userData: { email: string; lastName: string; firstName: string },
) => {
  const { email, lastName, firstName } = userData;
  const companyForm = companyData.forms.company;
  const xml = create({ version: '1.0', encoding: 'UTF-8' }).ele(
    'fc2:EFilingSubmissionXML',
    {
      'xmlns:fc2': 'www.fincen.gov/base',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation':
        'www.fincen.gov/base https://www.fincen.gov/sites/default/files/schema/base/BOIRSchema.xsd',
      SeqNum: '1',
    },
  );

  xml.ele('fc2:SubmitterElectronicAddressText').txt(email);
  xml.ele('fc2:SubmitterEntityIndivdualLastName').txt(lastName);
  xml.ele('fc2:SubmitterIndivdualFirstName').txt(firstName);
  // activity
  const activity = xml.ele('fc2:Activity', { SeqNum: '2' });
  addDataElement(activity, 'ApprovalOfficialSignatureDateText', '20241105'); // change to correct
  addDataElement(
    activity,
    'EFilingPriorReportingCompanyIdentificationNumberText',
    companyForm.taxInfo.taxIdNumber,
  );
  addDataElement(
    activity,
    'EFilingPriorReportingCompanyIdentificationTypeCode',
    BOIRCompanyFormParser.taxInfo.taxIdType(companyForm.taxInfo.taxIdType),
  );

  if (companyForm.taxInfo.taxIdType === 'Foreign') {
    addDataElement(
      activity,
      'EFilingPriorReportingCompanyIssuerCountryCodeText',
      getEnumKeyByValue(
        companyForm.taxInfo.countryOrJurisdiction,
        AllCountryEnum,
      ),
    );
  }

  addDataElement(
    activity,
    'EFilingPriorReportingCompanyName',
    companyForm.names.legalName,
  );
  // activity association
  addDataElement(activity, 'FillingDateText', null);
  const activityAssociation = activity.ele('fc2:ActivityAssociation', {
    SeqNum: '3',
  });
  addDataElement(
    activityAssociation,
    'CorrectsAmendsPriorReportIndicator',
    'Y',
  );

  reportCompanyParty(activity, companyForm, companyData);
  const applicantForm = companyData.forms.applicants[0]; //change
  applicantFormParty(activity, applicantForm, companyData);
  // activity part 2

  return xml.end({ prettyPrint: true });
};

function applicantFormParty(
  activity: any,
  applicantForm: any,
  companyData: any,
) {
  const applicantFormParty = activity.ele('fc2:Party', {
    SeqNum: '10',
  });
  console.log(companyData);
  addDataElement(applicantFormParty, 'ActivityPartyTypeCode', '63');

  if (applicantForm.finCENID) {
    addDataElement(
      applicantFormParty,
      'FinCENID',
      applicantForm.finCENID.finCENID,
    );
  }

  addDataElement(
    applicantFormParty,
    'IndividualBirthDateText',
    BOIRDateParser(applicantForm.personalInfo.dateOfBirth),
  );

  const applicantPartyName = activity.ele('fc2:PartyName', {
    SeqNum: '12',
  });

  addDataElement(applicantPartyName, 'PartyNameTypeCode', 'L');
  addDataElement(
    applicantPartyName,
    'RawEntityIndividualLastName',
    applicantForm.personalInfo.lastOrLegalName,
  );
  addDataElement(
    applicantPartyName,
    'RawIndividualFirstName',
    applicantForm.personalInfo.firstName,
  );

  if (applicantForm.personalInfo.middleName) {
    addDataElement(
      applicantPartyName,
      'RawIndividualMiddleName',
      applicantForm.personalInfo.middleName,
    );
  }

  if (applicantForm.personalInfo.suffix) {
    addDataElement(
      applicantPartyName,
      'RawIndividualNameSuffixText',
      applicantForm.personalInfo.suffix,
    );
  }

  const applicantAddress = activity.ele('fc2:Address', {
    SeqNum: '13',
  });

  if (applicantForm.address.type === 'residential') {
    addDataElement(applicantAddress, 'BusinessAddressIndicator', 'Y');
  } else {
    addDataElement(applicantAddress, 'ResidentialAddressIndicator', 'Y');
  }

  addDataElement(applicantAddress, 'RawCityText', applicantForm.address.city);
  if (applicantForm.address.state) {
    addDataElement(
      applicantAddress,
      'RawCountryCodeText',
      getEnumKeyByValue(applicantForm.address.state, StatesEnum),
    );
  }

  addDataElement(
    applicantAddress,
    'RawCountryCodeText',
    getEnumKeyByValue(
      applicantForm.address.countryOrJurisdiction,
      AllCountryEnum,
    ),
  );

  addDataElement(
    applicantAddress,
    'RawStreetAddress1Text',
    applicantForm.address.address,
  );

  addDataElement(
    applicantAddress,
    'RawZIPCode',
    applicantForm.address.postalCode,
  );

  const applicantPartyIdentification = activity.ele('fc2:PartyIdentification', {
    SeqNum: '14',
  });
  console.log(applicantPartyIdentification);
  //   addDataElement(applicantPartyIdentification,'IssuerLocalTribalCodeText', )
}

function reportCompanyParty(activity: any, companyForm: any, companyData: any) {
  const reportCompanyParty = activity.ele('fc2:Party', {
    SeqNum: '4',
  });
  addDataElement(reportCompanyParty, 'ActivityPartyTypeCode', '62');
  addDataElement(
    reportCompanyParty,
    'ExistingReportingCompanyIndicator',
    BOIRCompanyFormParser.isExistingCompany(companyData.isExistingCompany),
  );

  if (companyForm.taxInfo.taxIdType === 'Foreign') {
    addDataElement(
      reportCompanyParty,
      'FormationCountryCodeText',
      getEnumKeyByValue(
        companyForm.formationJurisdiction.countryOrJurisdictionOfFormation,
        ForeignCountryEnum,
      ),
    );
    if (companyForm.formationJurisdiction.stateOfFormation) {
      addDataElement(
        reportCompanyParty,
        'FirstRegistrationStateCodeText',
        getEnumKeyByValue(
          companyForm.formationJurisdiction.stateOfFormation,
          StatesEnum,
        ),
      );
    }

    if (companyForm.formationJurisdiction.tribalJurisdiction) {
      addDataElement(
        reportCompanyParty,
        'FirstRegistrationLocalTribalCodeText',
        getEnumKeyByValue(
          companyForm.formationJurisdiction.tribalJurisdiction,
          TribalDataEnum,
        ),
      );
    }

    if (companyForm.formationJurisdiction.nameOfOtherTribal) {
      addDataElement(
        reportCompanyParty,
        'OtherFirstRegistrationLocalTribalText',
        companyForm.formationJurisdiction.nameOfOtherTribal,
      );
    }
  } else {
    addDataElement(
      reportCompanyParty,
      'FormationCountryCodeText',
      getEnumKeyByValue(
        companyForm.formationJurisdiction.countryOrJurisdictionOfFormation,
        AllCountryEnum,
      ),
    );

    if (companyForm.formationJurisdiction.stateOfFormation) {
      addDataElement(
        reportCompanyParty,
        'FormationStateCodeText',
        getEnumKeyByValue(
          companyForm.formationJurisdiction.stateOfFormation,
          StatesEnum,
        ),
      );
    }

    if (companyForm.formationJurisdiction.tribalJurisdiction) {
      addDataElement(
        reportCompanyParty,
        'FormationLocalTribalCodeText',
        getEnumKeyByValue(
          companyForm.formationJurisdiction.tribalJurisdiction,
          TribalDataEnum,
        ),
      );
    }

    if (companyForm.formationJurisdiction.nameOfOtherTribal) {
      addDataElement(
        reportCompanyParty,
        'OtherFormationLocalTribalText',
        companyForm.formationJurisdiction.nameOfOtherTribal,
      );
    }
  }

  addDataElement(
    reportCompanyParty,
    'RequestFinCENIDIndicator',
    companyForm.repCompanyInfo.requestToReceiveFID,
  );

  const companyLegalPartyName = reportCompanyParty.ele('fc2:PartyName', {
    SeqNum: '5',
  });

  addDataElement(companyLegalPartyName, 'PartyNameTypeCode', 'L');
  addDataElement(
    companyLegalPartyName,
    'RawPartyFullName',
    companyForm.names.legalName,
  );

  const companyAltPartyName = reportCompanyParty.ele('fc2:PartyName', {
    SeqNum: '6',
  });

  addDataElement(companyAltPartyName, 'PartyNameTypeCode', 'DBA');
  companyForm.names.altName.forEach((name) => {
    addDataElement(companyAltPartyName, 'RawPartyFullName', name);
  });

  const companyAddress = reportCompanyParty.ele('fc2:Address', {
    SeqNum: '7',
  });

  addDataElement(companyAddress, 'RawCityText', companyForm.address.city);
  addDataElement(
    companyAddress,
    'RawCountryCodeText',
    getEnumKeyByValue(companyForm.address.usOrUsTerritory, AllCountryEnum),
  );
  addDataElement(
    companyAddress,
    'RawStateCodeText',
    getEnumKeyByValue(companyForm.address.state, StatesEnum),
  );
  addDataElement(
    companyAddress,
    'RawStreetAddress1Text',
    companyForm.address.address,
  );
  addDataElement(companyAddress, 'RawZIPCode', companyForm.address.zipCode);

  const identificationParty = reportCompanyParty.ele(
    'fc2:PartyIdentification',
    {
      SeqNum: '8',
    },
  );
  if (companyForm.taxInfo.taxIdType === 'Foreign') {
    addDataElement(
      identificationParty,
      'OtherIssuerCountryText',
      getEnumKeyByValue(
        companyForm.taxInfo.countryOrJurisdiction,
        ForeignCountryEnum,
      ),
    );
  }
  addDataElement(
    identificationParty,
    'PartyIdentificationNumberText',
    companyForm.taxInfo.taxIdNumber,
  );
  addDataElement(
    identificationParty,
    'PartyIdentificationTypeCode',
    BOIRCompanyFormParser.taxInfo.taxIdType(companyForm.taxInfo.taxIdType),
  );

  const companyOrganizationTypeSubtype = reportCompanyParty.ele(
    'fc2:OrganizationClassificationTypeSubtype',
    {
      SeqNum: '9',
    },
  );

  if (companyForm.repCompanyInfo.foreignPooled) {
    addDataElement(companyOrganizationTypeSubtype, 'OrganizationTypeID', '19');
  }
}
