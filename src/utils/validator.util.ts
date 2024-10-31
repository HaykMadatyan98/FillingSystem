import { companyFormFields } from '@/company-form/constants';
import { CSVCompanyFormDto } from '@/company-form/dtos/company-form.dto';
import {
  ApplicantData,
  CompanyData,
  countriesWithStates,
  OwnerData,
  UNITED_STATES,
  UserData,
} from '@/company/constants';
import { ISanitizedData } from '@/company/interfaces';
import { IErrorReasons } from '@/exceptions/error.interface';
import {
  applicantFormFields,
  ownerFormFields,
} from '@/participant-form/constants';
import {
  CSVApplicantFormDto,
  CSVOwnerFormDto,
} from '@/participant-form/dtos/participant-form.dto';
import { CSVUserDto } from '@/user/dtos/user.dto';
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
    if (participant.isApplicant) {
      applicants.push(participant);
    } else {
      owners.push(participant);
    }
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
  const { company, BOIRExpTime } = sanitized;
  let companyDeleted = false;
  const reasons: IErrorReasons[] = [];

  if (BOIRExpTime && isNaN(BOIRExpTime.getTime())) {
    reasons.push({
      fields: ['BOIR Submission Deadline'],
      problemDesc: 'Invalid BOIR expiration time',
    });

    companyDeleted = true;
  }

  if (!company.taxInfo.taxIdNumber || !company.taxInfo.taxIdType) {
    reasons.push({
      fields: [
        companyFormFields.taxInfo.taxIdNumber,
        companyFormFields.taxInfo.taxIdType,
      ],
      problemDesc:
        "Company's tax identification number or type is missing or invalid.",
    });

    companyDeleted = true;
  }

  if (
    company.taxInfo.taxIdType &&
    company.taxInfo.taxIdType !== 'Foreign' &&
    company.taxInfo.countryOrJurisdiction
  ) {
    reasons.push({
      fields: [
        companyFormFields.taxInfo.taxIdType,
        companyFormFields.taxInfo.countryOrJurisdiction,
      ],
      problemDesc:
        'Country or jurisdiction can only be specified if the tax type is "Foreign"',
    });

    companyDeleted = true;
  }

  if (
    company.formationJurisdiction &&
    !company.formationJurisdiction.countryOrJurisdictionOfFormation
  ) {
    reasons.push({
      fields: [
        companyFormFields.formationJurisdiction
          .countryOrJurisdictionOfFormation,
      ],
      problemDesc:
        'Formation jurisdiction is missing required country or jurisdiction data.',
    });

    companyDeleted = true;
  }

  const formationOfJurisdiction = company.formationJurisdiction;
  if (formationOfJurisdiction) {
    if (
      formationOfJurisdiction.countryOrJurisdictionOfFormation === UNITED_STATES
    ) {
      if (
        formationOfJurisdiction.stateOfFormation &&
        formationOfJurisdiction.tribalJurisdiction
      ) {
        const reasonData = {
          fields: [
            companyFormFields.formationJurisdiction.stateOfFormation,
            companyFormFields.formationJurisdiction.tribalJurisdiction,
          ],
          problemDesc:
            'Only one of "state" or "local/tribal" may be specified for United States entries',
        };

        companyDeleted = true;
        reasons.push(reasonData);
      }
    } else if (
      countriesWithStates.includes(
        formationOfJurisdiction.countryOrJurisdictionOfFormation,
      )
    ) {
      const reasonData = {
        fields: [],
        problemDesc: '',
      };

      if (
        formationOfJurisdiction.stateOfFormation !==
        formationOfJurisdiction.countryOrJurisdictionOfFormation
      ) {
        reasonData.fields.push(
          companyFormFields.formationJurisdiction.stateOfFormation,
        );
        reasonData.problemDesc =
          'The specified state does not match the country.';
        companyDeleted = true;
      }

      if (formationOfJurisdiction.tribalJurisdiction) {
        reasonData.fields.push(
          companyFormFields.formationJurisdiction.tribalJurisdiction,
        );
        reasonData.problemDesc =
          'The selected country does not support local or tribal data.';

        if (formationOfJurisdiction.nameOfOtherTribal) {
          reasonData.fields.push(
            companyFormFields.formationJurisdiction.nameOfOtherTribal,
          );
          reasonData.problemDesc =
            'The selected country does not support other local or tribal descriptions.';
        }

        companyDeleted = true;
        reasons.push(reasonData);
      }
    } else if (
      formationOfJurisdiction.stateOfFormation ||
      formationOfJurisdiction.tribalJurisdiction ||
      formationOfJurisdiction.nameOfOtherTribal
    ) {
      const reasonData = {
        fields: [],
        problemDesc: formationOfJurisdiction.countryOrJurisdictionOfFormation
          ? 'The selected country does not support state, local, or tribal data.'
          : 'Identification details include state, local, or tribal data without a specified country or jurisdiction.',
      };

      if (formationOfJurisdiction.stateOfFormation) {
        reasonData.fields.push(
          companyFormFields.formationJurisdiction.stateOfFormation,
        );
      }

      if (formationOfJurisdiction.tribalJurisdiction) {
        reasonData.fields.push(
          companyFormFields.formationJurisdiction.tribalJurisdiction,
        );
      }

      if (formationOfJurisdiction.nameOfOtherTribal) {
        reasonData.fields.push(
          companyFormFields.formationJurisdiction.nameOfOtherTribal,
        );
      }

      companyDeleted = true;
      reasons.push(reasonData);
    }
  }
  if (sanitized.participants && sanitized.participants.length) {
    const participants = sanitized.participants;
    for (let i = participants.length - 1; i >= 0; i--) {
      const formFields = participants[i].isApplicant
        ? applicantFormFields
        : ownerFormFields;
      if (
        (!participants[i].identificationDetails?.docType ||
          !participants[i].identificationDetails?.docNumber) &&
        !participants[i].finCENID?.finCENID
      ) {
        const reason = {
          fields: [
            formFields.identificationDetails.docType,
            formFields.identificationDetails.docNumber,
          ],

          problemDesc: `${participants[i].isApplicant ? 'Applicant' : 'Owner'} must have a valid document type and document number.`,
          affectedData: null,
        };

        delete participants[i].isApplicant;
        reason.affectedData = participants[i];

        reasons.push(reason);
        companyDeleted = true;
      }

      if (!(participants[i].finCENID && participants[i].finCENID.finCENID)) {
        const identificationDetails = participants[i].identificationDetails;

        if (identificationDetails) {
          if (identificationDetails.countryOrJurisdiction === UNITED_STATES) {
            if (
              identificationDetails.state &&
              identificationDetails.localOrTribal
            ) {
              const reasonData = {
                fields: [
                  formFields.identificationDetails.state,
                  formFields.identificationDetails.localOrTribal,
                ],
                problemDesc:
                  'Only one of "state" or "local/tribal" may be specified for United States entries',
                affectedData: [],
              };

              reasonData.affectedData.push(
                identificationDetails.state,
                identificationDetails.localOrTribal,
              );

              if (identificationDetails.otherLocalOrTribalDesc) {
                reasonData.affectedData.push(
                  identificationDetails.otherLocalOrTribalDesc,
                );
              }

              companyDeleted = true;
              reasons.push(reasonData);
            }
          } else if (
            countriesWithStates.includes(
              identificationDetails.countryOrJurisdiction,
            )
          ) {
            const reasonData = {
              fields: [],
              problemDesc: '',
              affectedData: [],
            };

            if (
              identificationDetails.state !==
              identificationDetails.countryOrJurisdiction
            ) {
              reasonData.fields.push(formFields.identificationDetails.state);
              reasonData.affectedData.push(identificationDetails.state);
              reasonData.problemDesc =
                'The specified state does not match the country.';
            }

            if (identificationDetails.localOrTribal) {
              reasonData.fields.push(
                formFields.identificationDetails.localOrTribal,
              );
              reasonData.affectedData.push(identificationDetails.localOrTribal);
              reasonData.problemDesc =
                'The selected country does not support local or tribal data.';

              if (identificationDetails.otherLocalOrTribalDesc) {
                reasonData.fields.push(
                  formFields.identificationDetails.otherLocalOrTribalDesc,
                );
                reasonData.affectedData.push(
                  identificationDetails.otherLocalOrTribalDesc,
                );
                reasonData.problemDesc =
                  'The selected country does not support other local or tribal descriptions.';
              }

              companyDeleted = true;
              reasons.push(reasonData);
            }
          } else if (
            identificationDetails.state ||
            identificationDetails.localOrTribal ||
            identificationDetails.otherLocalOrTribalDesc
          ) {
            const reasonData = {
              fields: [],
              problemDesc: identificationDetails.countryOrJurisdiction
                ? 'The selected country does not support state, local, or tribal data.'
                : 'Identification details include state, local, or tribal data without a specified country or jurisdiction.',
              affectedData: [],
            };

            if (identificationDetails.state) {
              reasonData.fields.push(formFields.identificationDetails.state);
              reasonData.affectedData.push(identificationDetails.state);
            }

            if (identificationDetails.localOrTribal) {
              reasonData.fields.push(
                formFields.identificationDetails.localOrTribal,
              );
              reasonData.affectedData.push(identificationDetails.localOrTribal);
            }

            if (identificationDetails.otherLocalOrTribalDesc) {
              reasonData.fields.push(
                formFields.identificationDetails.otherLocalOrTribalDesc,
              );
              reasonData.affectedData.push(
                identificationDetails.otherLocalOrTribalDesc,
              );
            }

            companyDeleted = true;
            reasons.push(reasonData);
          }
        }
      }
    }
  }
  return {
    reasons,
    companyDeleted,
  };
}
