import { ApiProperty } from '@nestjs/swagger';
import { companyResponseMsgs } from '../constants';

export class CsvUploadResponseDto {
  @ApiProperty({ example: companyResponseMsgs.csvUploadSuccesfull })
  message: string;
}

export class CompanyCreatedResponseDto {}

export class CompanyUpdatedReponseDto {}

export class CompanyDeletedResponseDto {}

export class CompanyGetAllResponseDto {}
