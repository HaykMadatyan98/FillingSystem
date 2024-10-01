import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CompanyQueryDto {
  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  size: number;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  page: number;

  @ApiProperty({required: false})
  @IsBooleanString()
  @IsOptional()
  addedToUser: boolean
}
