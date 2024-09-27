import { ApiProperty } from '@nestjs/swagger';
import { companyResponseMsgs } from '../constants';

export class CsvUploadResponseDto {
  @ApiProperty({ example: companyResponseMsgs.csvUploadSuccessful })
  message: string;
}

export class CompanyCreatedResponseDto {}

export class CompanyUpdatedResponseDto {}

export class CompanyDeletedResponseDto {}

export class CompanyGetAllResponseDto {}
