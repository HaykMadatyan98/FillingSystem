export const BOIRCompanyFormParser = {
  isExistingCompany: (value: boolean) => (value ? 'Y' : 'F'),
  repCompanyInfo: { requestToReceive: (value: boolean) => (value ? 'Y' : 'F') },
  taxInfo: {
    taxIdType: (value: string) => {
      switch (value) {
        case 'EIN':
          return '2';
        case 'Foreign':
          return '9';
        case 'SSN/ITIN':
          return '1';
      }
    },
  },
};

export const BOIRUseParseData = {
  user: {
    firstName: 'SubmitterIndivdualFirstName',
    lastName: 'SubmitterEntityIndivdualLastName',
    email: 'SubmitterElectronicAddressText',
  },
};

export const BOIRDateParser = (date) => {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
};
