import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import {
  ApplicantForm,
  OwnerForm,
} from '@/owner-applicant-form/schemas/owner-applicant-form.schema';

export async function sanitizeData(rawData: any): Promise<{
  company: CompanyForm;
  applicant: ApplicantForm;
  owner: OwnerForm;
}> {
  const company: CompanyForm = {
    repCompanyInfo: {
      requestToReceiveFID:
        rawData['Applicant Existing Report Company'] === 'true',
      foreignPooled: false,
    },
    names: {
      legalName: rawData['Legal Name'] || '',
      altName: rawData['Alternate Name'] || '',
    },
    formationJurisdiction: {
      countryOrJurisdiction: rawData['Country/Jurisdiction of Formation'] || '',
    },
    taxInfo: {
      taxIdType: rawData['Tax ID Type'] || '',
      taxIdNumber: rawData['Tax ID Number']
        ? Number(rawData['Tax ID Number'])
        : 0,
      countryOrJurisdiction: rawData['Country/Jurisdiction'] || '',
    },
    address: {
      address: rawData['Company Address'] || '',
      city: rawData['Company City'] || '',
      usOrUsTerritory: rawData['US or Territory'] || '',
      state: rawData['Company State'] || '',
      zipCode: rawData['Company ZIP Code'] || '',
    },
  };

  const applicant: any = {
    applicant: {
      isExistingCompany:
        rawData['Applicant Existing Report Company'] === 'true',
    },
    applicantFinCENID: {
      finCENID: rawData['Applicant FinCEN ID'] || '',
    },
    personalInfo: {
      lastOrLegalName: rawData['Applicant Last Name'] || '',
      firstName: rawData['Applicant First Name'] || '',
      middleName: rawData['Applicant Middle Name'] || '',
      suffix: rawData['Applicant Suffix'] || '',
      dateOfBirth: new Date(rawData['Applicant DOB']) || null,
    },
    address: {
      type:
        rawData['Applicant Address Type'] === 'RESIDENTIAL'
          ? 'residential'
          : 'business',
      address: rawData['Applicant Address'] || '',
      city: rawData['Applicant City'] || '',
      countryOrJurisdiction: rawData['Applicant Country'] || '',
      state: rawData['Applicant State'] || '',
      postalCode: rawData['Applicant Postal Code'] || '',
    },
    identificationDetails: {
      docType: rawData['Applicant Doc Type'] || '',
      docNumber: rawData['Applicant Doc Number'] || '',
      countryOrJurisdiction: rawData['Applicant Country Jurisdiction'] || '',
      state: rawData['Applicant Doc State'] || '',
      localOrTribal: '',
      otherLocalOrTribalDesc: '',
      docImg: {
        blobId: rawData['Applicant Doc Image Blob ID'] || '',
        blobUrl: rawData['Applicant Doc Image Blob URL'] || '',
      },
    },
  };

  const owner: any = {
    beneficialOwner: {
      isParentOrGuard:
        rawData['Beneficial Owner Is Parent Or Guardian'] === 'true',
    },
    ownerFinCENID: {
      finCENID: rawData['Owner FinCEN ID'] || '',
    },
    exemptEntity: {
      isExemptEntity: rawData['Exempt Entity'] === 'true',
    },
    personalInfo: {
      lastOrLegalName: rawData['Owner Last Name'] || '',
      firstName: rawData['Owner First Name'] || '',
      middleName: rawData['Owner Middle Name'] || '',
      suffix: rawData['Owner Suffix'] || '',
      dateOfBirth: new Date(rawData['Owner DOB']) || null,
    },
    residentialAddress: {
      address: rawData['Owner Address'] || '',
      city: rawData['Owner City'] || '',
      countryOrJurisdiction: rawData['Owner Country'] || '',
      state: rawData['Owner State'] || '',
      postalCode: rawData['Owner Postal Code'] || '',
    },
    identificationDetails: {
      docType: rawData['Owner Doc Type'] || '',
      docNumber: rawData['Owner Doc Number'] || '',
      countryOrJurisdiction: rawData['Owner Country Jurisdiction'] || '',
      state: rawData['Applicant Doc State'] || '',
      localOrTribal: '',
      otherLocalOrTribalDesc: '',
      docImg: {
        blobId: rawData['Owner Doc Image Blob ID'] || '',
        blobUrl: rawData['Owner Doc Image Blob URL'] || '',
      },
    },
  };

  return { company, applicant, owner };
}
