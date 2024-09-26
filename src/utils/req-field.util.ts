import {
  requiredApplicantFields,
  requiredCompanyFields,
  requiredOwnerFields,
} from '@/company/constants/required-data-fields';

export function calculateRequiredAndEnteredFieldsCount(
  data: any,
  requiredFields: string[],
): [number, number] {
  let enteredFieldsCount = 0;
  const totalRequiredFieldsCount = requiredFields.length;

  requiredFields.forEach((fieldPath) => {
    const [start, end] = fieldPath.split('.');

    if (!!data[start]) {
      if (!!data[start][end]) {
        if (
          data[start][end] !== '' ||
          data[start][end] !== null ||
          data[start][end] !== undefined
        ) {
          enteredFieldsCount++;
        }
      }
    }
  });

  return [enteredFieldsCount, totalRequiredFieldsCount];
}

export async function calculateTotalFieldsForCompany(
  companyData: any,
): Promise<[number, number]> {
  let totalEnteredFields = 0;
  let totalRequiredFields = 0;

  const [enteredCompanyFields, totalCompanyFields] =
    calculateRequiredAndEnteredFieldsCount(
      companyData.forms.company,
      requiredCompanyFields,
    );
  totalEnteredFields += enteredCompanyFields;
  totalRequiredFields += totalCompanyFields;

  companyData.forms.owners.forEach((ownerData: any) => {
    const [enteredOwnerFields, totalOwnerFields] =
      calculateRequiredAndEnteredFieldsCount(ownerData, requiredOwnerFields);
    totalEnteredFields += enteredOwnerFields;
    totalRequiredFields += totalOwnerFields;
  });

  companyData.forms.applicants.forEach((applicantData: any) => {
    const [enteredApplicantFields, totalApplicantFields] =
      calculateRequiredAndEnteredFieldsCount(
        applicantData,
        requiredApplicantFields,
      );
    totalEnteredFields += enteredApplicantFields;
    totalRequiredFields += totalApplicantFields;
  });

  return [totalEnteredFields, totalRequiredFields];
}
