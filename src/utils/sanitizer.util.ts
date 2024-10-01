import { ICompanyForm } from '@/company-form/interfaces';
import { CompanyData, ParticipantData } from '@/company/constants';
import { ICompanyCSVRowData } from '@/company/interfaces';
import { ISanitizedData } from '@/company/interfaces/sanitized-data.interface';
import { IChangeParticipantForm } from '@/participant-form/interfaces';

export async function sanitizeData(
  data: ICompanyCSVRowData,
): Promise<ISanitizedData> {
  const sanitized: {
    company: ICompanyForm;
    participants: IChangeParticipantForm[];
  } = {
    company: {} as ICompanyForm,
    participants: [],
  };

  const participantKeys = Object.keys(
    ParticipantData,
  ) as (keyof typeof ParticipantData)[];
  const companyKeys = Object.keys(CompanyData) as (keyof typeof CompanyData)[];

  function convertValue(key: string, value: string) {
    if (key === 'Company Tax Id Number') {
      return Number(value);
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
    targetObj: Record<string, any>,
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

  // Map company fields
  companyKeys.forEach((key) => {
    const mappedField = CompanyData[key];
    const value = data[key];
    if (value) {
      mapFieldToObject(mappedField, value, sanitized.company);
    }
  });

  // Map applicant and owner participants
  const participantTypes = [
    { prefix: 'Applicant', isApplicant: true },
    { prefix: 'Owner', isApplicant: false },
  ];

  participantTypes.forEach(({ prefix, isApplicant }) => {
    const hasMultipleParticipants = data[`${prefix} First Name`]?.includes(',');

    if (hasMultipleParticipants) {
      // Handle multiple participants (comma-separated values)
      const firstNames = data[`${prefix} First Name`].split(',');
      firstNames.forEach((_, index) => {
        const participant: Record<string, any> = { isApplicant };
        participantKeys.forEach((key) => {
          const value = data[`${prefix} ${key}`];
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
      const participant: Record<string, any> = { isApplicant };
      participantKeys.forEach((key) => {
        const value = data[`${prefix} ${key}`];
        if (value) {
          const mappedField = ParticipantData[key];
          mapFieldToObject(mappedField, value, participant);
        }
      });
      sanitized.participants.push(participant);
    }
  });

  return sanitized;
}
