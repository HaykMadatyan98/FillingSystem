import { HttpException } from '@nestjs/common';
import { ExceptionResponse } from './exceptions.interface';

// Define the input shape as a type alias for better reusability
export type CustomExceptionInput = Omit<ExceptionResponse, 'status'>;

export class CustomNotFoundException extends HttpException {
  constructor({ message, description }: CustomExceptionInput) {
    const response: ExceptionResponse = {
      message,
      description,
      status: 404, 
    };
    super(response, 404);
  }
}
