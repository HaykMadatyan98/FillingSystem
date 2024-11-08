import {
  ApplicantData,
  CompanyData,
  OwnerData,
  UserData,
} from '@/company/constants';
import {
  ICompanyData,
  IParticipantData,
  ISanitizedData,
} from '@/company/interfaces';
import { ICsvUser } from '@/company/interfaces/sanitized-data.interface';
import { clearWrongFields, validateData } from './validator.util';

export async function sanitizeData(data: any): Promise<{
  sanitized: ISanitizedData;
  errorData: any;
  reasons: any;
  companyDeleted: boolean;
}> {
  const sanitized: ISanitizedData = {
    user: {} as ICsvUser,
    company: {} as ICompanyData,
    participants: [] as IParticipantData[],
    BOIRExpTime: data['BOIR Submission Deadline'][0]
      ? new Date(data['BOIR Submission Deadline'][0])
      : null,
  };

  const companyKeys = Object.keys(CompanyData) as (keyof typeof CompanyData)[];
  const userKeys = Object.keys(UserData) as (keyof typeof UserData)[];
  const applicantKeys = Object.keys(
    ApplicantData,
  ) as (keyof typeof ApplicantData)[];
  const ownerKeys = Object.keys(OwnerData) as (keyof typeof OwnerData)[];

  function convertValue(key: string, value: string) {
    if (key === 'dateOfBirth') {
      return value ? new Date(value) : undefined;
    } else if (
      value.toLowerCase() === 'true' ||
      value.toLowerCase() === 'false'
    ) {
      return value.toLowerCase() === 'true';
    } else if (key === 'altName') {
      return value.trim().split(',');
    }
    return value;
  }

  function mapFieldToObject(
    mappedField: string,
    value: string,
    targetObj: IParticipantData | ICompanyData | ICsvUser,
  ) {
    const fieldParts = mappedField.split('.');
    let current = targetObj;

    fieldParts.forEach((part, index) => {
      if (index === fieldParts.length - 1) {
        current[part] = convertValue(part, value);
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  userKeys.forEach((key) => {
    const mappedField = UserData[key];
    const value = data[key].join('');
    if (value && value !== '') {
      mapFieldToObject(mappedField, value, sanitized.user);
    }
  });

  companyKeys.forEach((key) => {
    const mappedField = CompanyData[key];
    const value = data[key].join('');
    if (value && value !== '') {
      mapFieldToObject(mappedField, value, sanitized.company);
    }
  });

  if (
    !(
      sanitized.company.isExistingCompany ||
      (sanitized.company.repCompanyInfo &&
        sanitized.company.repCompanyInfo.foreignPooled)
    )
  ) {
    const applicantCount =
      data['Applicant Document Type']?.length ||
      data['Applicant FinCEN ID']?.length;
    for (let i = 0; i < applicantCount; i++) {
      const participant: any = { isApplicant: true };

      applicantKeys.forEach((key) => {
        const mappedField = ApplicantData[key];
        const value = data[key][i];
        if (value !== undefined && value !== '') {
          mapFieldToObject(mappedField, value, participant);
        }
      });

      sanitized.participants.push(participant);
    }
  }

  const ownerCountBySanitizedData =
    data['Owner Document Type']?.length || data['Owner FinCEN ID']?.length;
  const ownerCount = sanitized.company.repCompanyInfo.foreignPooled
    ? 1
    : ownerCountBySanitizedData;

  for (let i = 0; i < ownerCount; i++) {
    const participant: any = { isApplicant: false };

    ownerKeys.forEach((key) => {
      const mappedField = OwnerData[key];
      const value = data[key][i];
      if (value !== undefined && value !== '') {
        mapFieldToObject(mappedField, value, participant);
      }
    });

    sanitized.participants.push(participant);
  }

  const { isDeletedCompany, errorData } = await validateData(sanitized);
  const { reasons, companyDeleted } = await clearWrongFields(sanitized);

  if (
    ownerCountBySanitizedData !== ownerCount &&
    ownerCountBySanitizedData > ownerCount
  ) {
    reasons.push({
      fields: ['Company Foreign Pooled'],
      problemDesc: 'Foreign pooled company need only one owner data',
      affectedData: [
        `Other ${ownerCountBySanitizedData - ownerCount} Owners Data`,
      ],
    });
  }

  if (isDeletedCompany) {
    reasons.push({
      fields:[ 'All Company Fields'],
      problemDesc: 'Company could not be created because one or more required fields contain incorrect or missing information.'
    })
  }

  return {
    sanitized,
    reasons,
    errorData,
    companyDeleted: companyDeleted || isDeletedCompany,
  };
}
