import { CompanyData, ParticipantData, UserData } from '@/company/constants';
import {
  ICompanyCSVRowData,
  ICompanyData,
  ISanitizedData,
  IParticipantData,
} from '@/company/interfaces';
import { validateData } from './validator.util';
import { ConflictException } from '@nestjs/common';
import { ICsvUser } from '@/company/interfaces/sanitized-data.interface';

export async function sanitizeData(
  data: ICompanyCSVRowData,
): Promise<ISanitizedData> {
  const sanitized: ISanitizedData = {
    user: {} as ICsvUser,
    company: {} as ICompanyData,
    participants: [] as IParticipantData[],
  };

  const participantKeys = Object.keys(
    ParticipantData,
  ) as (keyof typeof ParticipantData)[];
  const companyKeys = Object.keys(CompanyData) as (keyof typeof CompanyData)[];
  const userKeys = Object.keys(UserData) as (keyof typeof UserData)[];

  function convertValue(key: string, value: string) {
    if (key === 'taxIdNumber') {
      return Number(value);
    } else if (key === 'dateOfBirth') {
      return value ? new Date(value) : undefined;
    } else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    }
    return value.trim();
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
    const value = data[key];
    if (value) {
      mapFieldToObject(mappedField, value, sanitized.user);
    }
  });

  companyKeys.forEach((key) => {
    const mappedField = CompanyData[key];
    const value = data[key];
    if (value) {
      mapFieldToObject(mappedField, value, sanitized.company);
    }
  });

  const participantTypes = [
    { prefix: 'Applicant', isApplicant: true },
    { prefix: 'Owner', isApplicant: false },
  ];

  participantTypes.forEach(({ prefix, isApplicant }) => {
    const hasMultipleParticipants = data[`${prefix} First Name`]?.includes(',');

    if (hasMultipleParticipants) {
      const firstNames = data[`${prefix} First Name`].split(',');
      firstNames.forEach((_, index) => {
        const participant: any = { isApplicant };
        participantKeys.forEach((key) => {
          const value = data[`${prefix} ${key}`];
          if (value) {
            const splitValues = value.split(',');
            const trimmedValue = splitValues[index]?.trim();
            if (trimmedValue) {
              const mappedField = ParticipantData[key];

              mapFieldToObject(
                mappedField,
                trimmedValue,
                participant as IParticipantData,
              );
            }
          }
        });

        if (isApplicant && participant.address) {
          if (!participant.address.type) {
            throw new ConflictException('Address type is missing');
          }
        }

        sanitized.participants.push({ ...participant });
      });
    } else {
      const participant: any = { isApplicant };
      participantKeys.forEach((key) => {
        const value = data[`${prefix} ${key}`];
        if (value) {
          const mappedField = ParticipantData[key];
          mapFieldToObject(mappedField, value, participant as IParticipantData);
        }
      });

      if (isApplicant && participant.address) {
        if (!participant.address.type) {
          throw new ConflictException('Address type is missing');
        }
      }

      sanitized.participants.push({ ...participant });
    }
  });

  if (
    sanitized.company.taxInfo.taxIdType &&
    sanitized.company.taxInfo.taxIdType !== 'Foreign' &&
    sanitized.company.taxInfo.countryOrJurisdiction
  ) {
    throw new ConflictException(
      'Country/Jurisdiction can be added only if tax type is Foreign',
    );
  }

  await validateData(sanitized);

  console.log(sanitized);
  return sanitized;
}
