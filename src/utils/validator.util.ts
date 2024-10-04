import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateData(data: any, dto: any) {
  const dtoInstances = plainToInstance(
    dto,
    Array.isArray(data) ? data : [data],
  );

  const validationResults = await Promise.all(
    dtoInstances.map((instance) =>
      validate(instance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    ),
  );

  const errorMessages = validationResults
    .map((errors, index) => errors.map((error) => formatError(error, index)))
    .flat();

  if (errorMessages.length > 0) {
    throw new ConflictException(
      `Validation for CSV failed: ${errorMessages.join('; ')}`,
    );
  }
}

function formatError(error: any, index: number): string {
  const { property, constraints, value, children } = error;
  let message = '';

  if (constraints) {
    const constraintMessages = Object.values(constraints).join(', ');
    const valueDisplay =
      typeof value === 'object' ? JSON.stringify(value) : value;
    message = `Property "${property}" with value "${valueDisplay}" failed due to: ${constraintMessages}`;
  }

  if (children?.length > 0) {
    message += children
      .map((childError) => formatError(childError, index))
      .join('; ');
  }

  if (!constraints && !children?.length) {
    const valueDisplay =
      typeof value === 'object' ? JSON.stringify(value) : value;
    message = `Validation failed for item ${index}: Property "${property}" with value "${valueDisplay}" failed due to unknown constraint.`;
  }

  return message;
}
