import { CSVCompanyFormDto } from '@/company-form/dtos/company-form.dto';
import {
  ApplicantData,
  CompanyData,
  OwnerData,
  UserData,
} from '@/company/constants';
import { ISanitizedData } from '@/company/interfaces';
import {
  CSVApplicantFormDto,
  CSVOwnerFormDto,
} from '@/participant-form/dtos/participant-form.dto';
import { CSVUserDto } from '@/user/dtos/user.dto';
import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateData(data: any) {
  const errorData: {
    user?: { fieldName: string; value: string }[];
    owner?: { fieldName: string; value: string }[];
    applicant?: { fieldName: string; value: string }[];
    company?: { fieldName: string; value: string }[];
  } = {};

  await validateTheData(CSVUserDto, data.user, errorData, 'user', UserData);
  await validateTheData(
    CSVCompanyFormDto,
    data.company,
    errorData,
    'company',
    CompanyData,
  );

  const owners = [];
  const applicants = [];

  data.participants.forEach((participant) => {
    participant.isApplicant
      ? applicants.push(participant)
      : owners.push(participant);
  });

  await validateTheData(
    CSVApplicantFormDto,
    applicants,
    errorData,
    'applicant',
    ApplicantData,
  );

  await validateTheData(CSVOwnerFormDto, owners, errorData, 'owner', OwnerData);

  return errorData;
}

// function formatError(
//   error: any,
//   context: string,
//   allowNesting: boolean,
//   enumData?: any,
// ): string {
//   const { property, constraints, value, children } = error;
//   let message = '';

//   if (constraints) {
//     const constraintMessages = Object.values(constraints).join(', ');
//     const valueDisplay =
//       typeof value === 'object' ? JSON.stringify(value) : value;
//     message = `Property "${property}" with value "${valueDisplay}" in ${context} failed`;
//   }

//   if (allowNesting && children?.length > 0) {
//     message += children
//       .map((childError) => formatError(childError, context, allowNesting))
//       .join('; ');
//   }

//   if (!constraints && !children?.length) {
//     const valueDisplay =
//       typeof value === 'object' ? JSON.stringify(value) : value;
//     message = `Validation failed in ${context}: Property "${property}" with value "${valueDisplay}" failed due to unknown constraint.`;
//   }

//   return message;
// }

function getEnumKeyByValue(value: string, enumData: any): string {
  return Object.keys(enumData).find(
    (key) => enumData[key as keyof typeof enumData] === value,
  );
}

async function validateTheData(
  dto: any,
  data: any,
  errorData: any,
  type: 'user' | 'company' | 'applicant' | 'owner',
  typeData: any,
) {
  if (type === 'user' || type === 'company') {
    const dtoInstance = plainToInstance(dto, data);
    const validationResults = await validate(dtoInstance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    });

    if (validationResults.length) {
      if (!errorData[type]) {
        errorData[type] = [];
      }

      const errorMessageData = validationResults[0];

      const countOfErrors = errorMessageData.children.length;
      for (let i = 0; i < countOfErrors; i++) {
        const fieldInDb =
          validationResults[0].property +
          '.' +
          validationResults[0].children[i]?.property;

        errorData[type].push({
          fieldName: getEnumKeyByValue(fieldInDb, typeData),
          value: validationResults[0].children[i].value,
        });
      }
    }
  } else if (type === 'applicant' || type === 'owner') {
    await Promise.all(
      data.map(async (participant: any) => {
        const participantDtoInstance = plainToInstance(dto, participant);
        participantDtoInstance;

        const participantValidationResults = await validate(
          participantDtoInstance as object,
          {
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: true,
          },
        );

        if (participantValidationResults.length) {
          if (!errorData[type]) {
            errorData[type] = [];
          }

          const errorMessageData = participantValidationResults[0];

          const countOfErrors = errorMessageData.children.length;
          for (let i = 0; i < countOfErrors; i++) {
            const fieldInDb =
              participantValidationResults[0].property +
              '.' +
              participantValidationResults[0].children[i]?.property;

            errorData[type].push({
              fieldName: getEnumKeyByValue(fieldInDb, typeData),
              value: participantValidationResults[0].children[i].value,
            });

            if (
              data[participantValidationResults[0].property] &&
              data[participantValidationResults[0].property][
                participantValidationResults[0].children[i]?.property
              ]
            ) {
              delete data[participantValidationResults[0].property][
                participantValidationResults[0].children[i]?.property
              ];
            }
          }
        }
      }),
    );
  }
}

export async function clearWrongFields(sanitized: ISanitizedData) {
  const { company } = sanitized;
  const reasons = [];

  if (!company.taxInfo.taxIdNumber || !company.taxInfo.taxIdType) {
    throw new ConflictException(
      "Company's tax identification number or type is missing or invalid.",
    );
  }

  if (
    sanitized.company.taxInfo.taxIdType &&
    sanitized.company.taxInfo.taxIdType !== 'Foreign' &&
    sanitized.company.taxInfo.countryOrJurisdiction
  ) {
    throw new ConflictException(
      'Country or jurisdiction can only be specified if the tax type is "Foreign".',
    );
  }

  if (
    company.formationJurisdiction &&
    !company.formationJurisdiction.countryOrJurisdictionOfFormation
  ) {
    reasons.push({
      field: 'Company Jurisdiction of Formation',
      problem:
        'Formation jurisdiction is missing required country or jurisdiction data.',
      missedData: company.formationJurisdiction,
    });
    delete company.formationJurisdiction;
  }

  if (sanitized.participants && sanitized.participants.length) {
    const participants = sanitized.participants;
    for (let i = participants.length - 1; i >= 0; i--) {
      if (
        !participants[i].identificationDetails.docType ||
        !participants[i].identificationDetails.docNumber
      ) {
        reasons.push({
          field: participants[i].isApplicant ? 'Applicant Form' : 'Owner Form',
          problem: `${participants[i].isApplicant ? 'Applicant' : 'Owner'} must have a valid document type and document number.`,
          missedData: participants[i],
        });
        participants.splice(i, 1);
      }

      const identificationDetails = participants[i].identificationDetails;
      if (
        (identificationDetails &&
          !identificationDetails.countryOrJurisdiction &&
          identificationDetails.state) ||
        identificationDetails.localOrTribal ||
        identificationDetails.otherLocalOrTribalDesc
      ) {
        const missedData = [];
        if (identificationDetails.state) {
          missedData.push(identificationDetails.state);
          delete identificationDetails.state;
        }

        if (identificationDetails.localOrTribal) {
          missedData.push(identificationDetails.localOrTribal);
          delete identificationDetails.localOrTribal;
        }

        if (identificationDetails.otherLocalOrTribalDesc) {
          missedData.push(identificationDetails.otherLocalOrTribalDesc);
          delete identificationDetails.otherLocalOrTribalDesc;
        }

        reasons.push({
          field: `${participants[i].isApplicant ? 'Applicant' : 'Owner'} Identification Details`,
          problem:
            'Identification details include state, local, or tribal data without a specified country or jurisdiction.',
          missedData,
        });
      }
    }
  }
  return reasons;
}
