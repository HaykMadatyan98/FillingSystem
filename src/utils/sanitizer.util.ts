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
