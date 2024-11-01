import {
  AllCountryEnum,
  DocumentTypeEnum,
  StatesEnum,
  TribalDataEnum,
} from '@/company/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FinCENIDDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-13-9]\d{11}$/)
  @Length(12, 12)
  finCENID?: string;
}
export class PersonalInformationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastOrLegalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: Date;
}

export class BeneficialOwnerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isParentOrGuard?: boolean;
}

enum AddressTypeEnum {
  BUSINESS = 'business',
  RESIDENTIAL = 'residential',
}

class OwnerAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  @Transform(({ value }) => AllCountryEnum[value] || value)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  @Transform(({ value }) => StatesEnum[value] || value)
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(9)
  postalCode?: string;
}

class ApplicantAddressDto extends OwnerAddressDto {
  @ApiProperty({ required: true })
  @IsEnum(AddressTypeEnum)
  @Transform(({ value }) => AddressTypeEnum[value] || value)
  type: AddressTypeEnum;
}
class IdentificationAndJurisdictionBaseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  @Transform(({ value }) => AllCountryEnum[value] || value)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  @Transform(({ value }) => StatesEnum[value] || value)
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TribalDataEnum)
  @Transform(({ value }) => TribalDataEnum[value] || value)
  localOrTribal?: TribalDataEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherLocalOrTribalDesc?: string;

  @ApiProperty({ required: true })
  @IsEnum(DocumentTypeEnum)
  @Transform(({ value }) => DocumentTypeEnum[value] || value)
  docType: string;

  @ApiProperty({ required: true })
  @IsString()
  docNumber: string;
}

class ExemptEntityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isExemptEntity?: boolean;
}

export class CSVIdentificationAndJurisdictionDto extends IdentificationAndJurisdictionBaseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  docImg?: string;
}

export class BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FinCENIDDto)
  finCENID?: FinCENIDDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PersonalInformationDto)
  personalInfo?: PersonalInformationDto;

  @ApiProperty({ required: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IdentificationAndJurisdictionBaseDto)
  identificationDetails: IdentificationAndJurisdictionBaseDto;
}

export class ApplicantFormDto extends BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ApplicantAddressDto)
  address?: ApplicantAddressDto;
}

export class OwnerFormDto extends BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BeneficialOwnerDto)
  beneficialOwner?: BeneficialOwnerDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExemptEntityDto)
  exemptEntity?: ExemptEntityDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OwnerAddressDto)
  address?: OwnerAddressDto;
}

export class CSVApplicantFormDto extends ApplicantFormDto {
  @ApiProperty({ required: true })
  @IsBoolean()
  isApplicant: boolean;

  @ApiProperty({ required: true })
  @ValidateNested({ each: true })
  @Type(() => CSVIdentificationAndJurisdictionDto)
  identificationDetails: CSVIdentificationAndJurisdictionDto;
}

export class CSVOwnerFormDto extends OwnerFormDto {
  @ApiProperty({ required: true })
  @IsBoolean()
  isApplicant: boolean;

  @ApiProperty({ required: true })
  @ValidateNested({ each: true })
  @Type(() => CSVIdentificationAndJurisdictionDto)
  identificationDetails: CSVIdentificationAndJurisdictionDto;
}

export class CreateParticipantDocDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isApplicant: boolean;

  @IsEnum(DocumentTypeEnum)
  @Transform(({ value }) => AllCountryEnum[value] || value)
  docType: DocumentTypeEnum;

  @IsString()
  docNum: string;
}
