import { ParticipantData, CompanyData } from '@/company/constants';

export async function sanitizeData(
  data: ICompanyApplicantData,
): Promise<Record<string, any>> {
  const sanitized: Record<string, any> = {
    company: {},
    participants: [],
  };

  const participantKeys = Object.keys(
    ParticipantData,
  ) as (keyof typeof ParticipantData)[];
  const companyKeys = Object.keys(CompanyData) as (keyof typeof CompanyData)[];

  function convertValue(key: string, value: string) {
    if (key === 'Company Tax Id Number') {
      return Number(value.trim()); 
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
        current[part] = convertValue(part, value); // Use the convertValue function
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

  const hasMultipleParticipants = data['First Name']?.includes(',');
  if (hasMultipleParticipants) {
    const firstNames = data['First Name'].split(',');
    firstNames.forEach((_, index) => {
      const participant: Record<string, any> = {};
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
    const participant: Record<string, any> = {};
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
