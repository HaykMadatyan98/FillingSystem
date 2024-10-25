import {
  ApplicantData,
  CompanyData,
  OwnerData,
  UserData,
} from '@/company/constants';
import {} from '@/company/constants/data-fields.enum';
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
    if (key === 'taxIdNumber' || key === 'finCENID') {
      return Number(value);
    } else if (key === 'dateOfBirth') {
      return value ? new Date(value) : undefined;
    } else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
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

  const applicantCount = data['Applicant Document Type']?.length;
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

  const ownerCount = data['Owner First Name']?.length;
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

  const errorData = await validateData(sanitized);
  const { reasons, companyDeleted } = await clearWrongFields(sanitized);

  return {
    sanitized: companyDeleted ? null : sanitized,
    reasons,
    errorData,
  };
}
