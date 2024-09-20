import { HttpException, HttpStatus } from '@nestjs/common';

type CustomExceptionType = {
  message: string;
  description: string;
  status: number;
};

export class CustomException extends HttpException {
  constructor({ message, description, status }: CustomExceptionType) {
    super({ message, description }, status);
  }
}
