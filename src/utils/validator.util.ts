import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CSVApplicantFormDto,
  CSVOwnerFormDto,
} from '@/participant-form/dtos/participant-form.dto';
import { CSVCompanyFormDto } from '@/company-form/dtos/company-form.dto';
import { CSVUserDto } from '@/user/dtos/user.dto';

export async function validateData(data: any) {
  const errorMessages: string[] = [];

  const userDtoInstance = plainToInstance(CSVUserDto, data.user);
  const userValidationResults = await validate(userDtoInstance as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  errorMessages.push(
    ...userValidationResults.map(
      (error) => formatError(error, 'user', false), 
    ),
  );

  const companyDtoInstance = plainToInstance(CSVCompanyFormDto, data.company);
  const companyValidationResults = await validate(
    companyDtoInstance as object,
    {
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  );
  errorMessages.push(
    ...companyValidationResults.map(
      (error) => formatError(error, 'company', true),
    ),
  );

  const participantErrors = await Promise.all(
    data.participants.map(async (participant: any, index: number) => {
      const dto: any = participant.isApplicant
        ? CSVApplicantFormDto
        : CSVOwnerFormDto;

      const participantDtoInstance = plainToInstance(dto, participant);
      const participantValidationResults = await validate(
        participantDtoInstance as object,
        {
          whitelist: true,
          forbidNonWhitelisted: true,
        },
      );

      return participantValidationResults.map(
        (error) => formatError(error, `participant at index ${index}`, true), 
      );
    }),
  );

  participantErrors.forEach((participantError) =>
    errorMessages.push(...participantError),
  );

  if (errorMessages.length > 0) {
    throw new ConflictException(
      `Validation for CSV failed: ${errorMessages.join('; ')}`,
    );
  }
}

function formatError(
  error: any,
  context: string,
  allowNesting: boolean,
): string {
  const { property, constraints, value, children } = error;
  let message = '';

  if (constraints) {
    const constraintMessages = Object.values(constraints).join(', ');
    const valueDisplay =
      typeof value === 'object' ? JSON.stringify(value) : value;
    message = `Property "${property}" with value "${valueDisplay}" in ${context} failed due to: ${constraintMessages}`;
  }

  if (allowNesting && children?.length > 0) {
    message += children
      .map((childError) => formatError(childError, context, allowNesting))
      .join('; ');
  }

  if (!constraints && !children?.length) {
    const valueDisplay =
      typeof value === 'object' ? JSON.stringify(value) : value;
    message = `Validation failed in ${context}: Property "${property}" with value "${valueDisplay}" failed due to unknown constraint.`;
  }

  return message;
}
