import { CountryEnum } from '@/company/constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateData(data: any, dto: any) {
  // Check if the data is an array or a single object
  const isArray = Array.isArray(data);
  let dataA = data;
  if (isArray) {
    dataA = data.map((element) => {
      delete element['isApplicant'];
      return element;
    });
  } else {
    delete data['isApplicant'];
    dataA = data;
  }

  const dtoInstances = plainToInstance(dto, isArray ? dataA : [dataA]);

  if (
    isArray &&
    Object.values(CountryEnum).includes(data[0].address.countryOrJurisdiction)
  ) {
    console.log(
      'Country:',
      'Enum Match:',
      CountryEnum[data[0].address.countryOrJurisdiction],
    );
  }

  // Validate each instance (single object or array of objects)
  const validationPromises = dtoInstances.map((instance) =>
    validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const validationResults = await Promise.all(validationPromises);

  // Process and log the validation results
  validationResults.forEach((errors, index) => {
    if (errors.length > 0) {
      console.error(`Validation failed for item ${index}:`, errors);
    } else {
      console.log(`Validation succeeded for item ${index}`);
    }
  });
}
