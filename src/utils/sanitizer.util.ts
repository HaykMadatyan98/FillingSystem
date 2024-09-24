import { ParticipantData, CompanyData } from '@/constants/data-fields';

export async function sanitizeData(
  data: Record<string, string>,
): Promise<Record<string, any>> {
  const sanitized: Record<string, any> = {
    company: {},
    participants: [],
  };

  const participantKeys = Object.keys(
    ParticipantData,
  ) as (keyof typeof ParticipantData)[];
  const companyKeys = Object.keys(CompanyData) as (keyof typeof CompanyData)[];

  function mapFieldToObject(
    mappedField: string,
    value: string,
    targetObj: Record<string, any>,
  ) {
    const fieldParts = mappedField.split('.');
    let current = targetObj;

    fieldParts.forEach((part, index) => {
      if (index === fieldParts.length - 1) {
        current[part] = value.trim();
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  companyKeys.forEach((key) => {
    const mappedField = CompanyData[key];
    const value = data[key];
    if (value) {
      mapFieldToObject(mappedField, value, sanitized.company);
    }
  });

  const hasMultipleParticipants = data['First Name']?.includes(',');
  if (hasMultipleParticipants) {
    const firstNames = data['First Name'].split(',');
    firstNames.forEach((_, index) => {
      const participant = {};
      participantKeys.forEach((key) => {
        const value = data[key];
        if (value) {
          const splitValues = value.split(',');
          const trimmedValue = splitValues[index]?.trim();
          if (trimmedValue) {
            const mappedField = ParticipantData[key];
            mapFieldToObject(mappedField, trimmedValue, participant);
          }
        }
      });
      sanitized.participants.push(participant);
    });
  } else {
    const participant = {};
    participantKeys.forEach((key) => {
      const mappedField = ParticipantData[key];
      const value = data[key];
      if (value) {
        mapFieldToObject(mappedField, value, participant);
      }
    });
    sanitized.participants.push(participant);
  }

  return sanitized;
}

// import { ParticipantData, CompanyData } from '@/constants/data-fields';

// export async function sanitizeData(
//   data: Record<string, string>,
// ): Promise<Record<string, any>> {
//   const sanitized: Record<string, any> = {};

//   const participantFields = Object.keys(
//     ParticipantData,
//   ) as (keyof typeof ParticipantData)[];
//   participantFields.forEach((key) => {
//     const mappedField = ParticipantData[key];
//     const value = data[key];
//     if (value) {
//       const fieldParts = mappedField.split('.'); // Split the dot notation (e.g. 'personalInfo.firstName')
//       let current = sanitized;

//       // Traverse the object structure to assign the value
//       fieldParts.forEach((part, index) => {
//         if (index === fieldParts.length - 1) {
//           current[part] = value.trim(); // Assign the final value
//         } else {
//           current[part] = current[part] || {}; // Ensure intermediate objects are created
//           current = current[part];
//         }
//       });
//     }
//   });

//   const companyFields = Object.keys(
//     CompanyData,
//   ) as (keyof typeof CompanyData)[];
//   companyFields.forEach((key) => {
//     const mappedField = CompanyData[key];
//     const value = data[key];
//     if (value) {
//       const fieldParts = mappedField.split('.');
//       let current = sanitized;

//       fieldParts.forEach((part, index) => {
//         if (index === fieldParts.length - 1) {
//           current[part] = value.trim();
//         } else {
//           current[part] = current[part] || {};
//           current = current[part];
//         }
//       });
//     }
//   });

//   return sanitized;
// }

// import { CompanyForm } from '@/company-form/schemas/company-form.schema';
// import {
//   ApplicantForm,
//   OwnerForm,
// } from '@/owner-applicant-form/schemas/owner-applicant-form.schema';

// export async function sanitizeData(rawData: any): Promise<{
//   company: CompanyForm;
//   applicant: ApplicantForm;
//   owner: OwnerForm;
// }> {
//   const company: CompanyForm = {
//     repCompanyInfo: {
//       requestToReceiveFID:
//         rawData['Applicant Existing Report Company'] === 'true',
//       foreignPooled: false,
//     },
//     names: {
//       legalName: rawData['Legal Name'] || '',
//       altName: rawData['Alternate Name'] || '',
//     },
//     formationJurisdiction: {
//       countryOrJurisdiction: rawData['Country/Jurisdiction of Formation'] || '',
//     },
//     taxInfo: {
//       taxIdType: rawData['Tax ID Type'] || '',
//       taxIdNumber: rawData['Tax ID Number']
//         ? Number(rawData['Tax ID Number'])
//         : 0,
//       countryOrJurisdiction: rawData['Country/Jurisdiction'] || '',
//     },
//     address: {
//       address: rawData['Company Address'] || '',
//       city: rawData['Company City'] || '',
//       usOrUsTerritory: rawData['US or Territory'] || '',
//       state: rawData['Company State'] || '',
//       zipCode: rawData['Company ZIP Code'] || '',
//     },
//   };

//   const applicant: any = {
//     applicant: {
//       isExistingCompany:
//         rawData['Applicant Existing Report Company'] === 'true',
//     },
//     applicantFinCENID: {
//       finCENID: rawData['Applicant FinCEN ID'] || '',
//     },
//     personalInfo: {
//       lastOrLegalName: rawData['Applicant Last Name'] || '',
//       firstName: rawData['Applicant First Name'] || '',
//       middleName: rawData['Applicant Middle Name'] || '',
//       suffix: rawData['Applicant Suffix'] || '',
//       dateOfBirth: new Date(rawData['Applicant DOB']) || null,
//     },
//     address: {
//       type:
//         rawData['Applicant Address Type'] === 'RESIDENTIAL'
//           ? 'residential'
//           : 'business',
//       address: rawData['Applicant Address'] || '',
//       city: rawData['Applicant City'] || '',
//       countryOrJurisdiction: rawData['Applicant Country'] || '',
//       state: rawData['Applicant State'] || '',
//       postalCode: rawData['Applicant Postal Code'] || '',
//     },
//     identificationDetails: {
//       docType: rawData['Applicant Doc Type'] || '',
//       docNumber: rawData['Applicant Doc Number'] || '',
//       countryOrJurisdiction: rawData['Applicant Country Jurisdiction'] || '',
//       state: rawData['Applicant Doc State'] || '',
//       localOrTribal: '',
//       otherLocalOrTribalDesc: '',
//       docImg: {
//         blobId: rawData['Applicant Doc Image Blob ID'] || '',
//         blobUrl: rawData['Applicant Doc Image Blob URL'] || '',
//       },
//     },
//   };

//   const owner: any = {
//     beneficialOwner: {
//       isParentOrGuard:
//         rawData['Beneficial Owner Is Parent Or Guardian'] === 'true',
//     },
//     ownerFinCENID: {
//       finCENID: rawData['Owner FinCEN ID'] || '',
//     },
//     exemptEntity: {
//       isExemptEntity: rawData['Exempt Entity'] === 'true',
//     },
//     personalInfo: {
//       lastOrLegalName: rawData['Owner Last Name'] || '',
//       firstName: rawData['Owner First Name'] || '',
//       middleName: rawData['Owner Middle Name'] || '',
//       suffix: rawData['Owner Suffix'] || '',
//       dateOfBirth: new Date(rawData['Owner DOB']) || null,
//     },
//     residentialAddress: {
//       address: rawData['Owner Address'] || '',
//       city: rawData['Owner City'] || '',
//       countryOrJurisdiction: rawData['Owner Country'] || '',
//       state: rawData['Owner State'] || '',
//       postalCode: rawData['Owner Postal Code'] || '',
//     },
//     identificationDetails: {
//       docType: rawData['Owner Doc Type'] || '',
//       docNumber: rawData['Owner Doc Number'] || '',
//       countryOrJurisdiction: rawData['Owner Country Jurisdiction'] || '',
//       state: rawData['Applicant Doc State'] || '',
//       localOrTribal: '',
//       otherLocalOrTribalDesc: '',
//       docImg: {
//         blobId: rawData['Owner Doc Image Blob ID'] || '',
//         blobUrl: rawData['Owner Doc Image Blob URL'] || '',
//       },
//     },
//   };

//   return { company, applicant, owner };
// }
