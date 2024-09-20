import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExceptionResponse } from './exceptions.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name); 

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const responseObject: ExceptionResponse =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as ExceptionResponse)
        : { message: String(exceptionResponse) };


    this.logger.error(
      `Error occurred: ${responseObject.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const jsonResponse: any = {
      statusCode: status,
      message: responseObject.message,
    };

    if (responseObject.description) {
      jsonResponse.description = responseObject.description;
    }

    response.status(status).json(jsonResponse);
  }
}
