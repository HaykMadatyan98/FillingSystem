import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormsDto {
  @ApiProperty({ description: 'ID of the company' })
  @IsMongoId()
  company: string;

  @ApiProperty({ description: 'Array of applicant IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  applicants: string[];

  @ApiProperty({ description: 'Array of owner IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  owner: string[];
}

export class CreateCompanyDto {
  @ApiProperty({ description: 'Name of the company' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Count of answers' })
  @IsNumber()
  answerCount: number;

  @ApiProperty({ description: 'Expiration time of the company record' })
  @IsDate()
  expTime: Date;
}
