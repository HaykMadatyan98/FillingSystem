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
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExistingCompanyApplicantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isExistingCompany?: boolean;
}
export class FinCENIDDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
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
  @IsDate()
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
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

class ApplicantAddressDto extends OwnerAddressDto {
  @ApiProperty({ required: true })
  @IsEnum(AddressTypeEnum)
  type: AddressTypeEnum;
}
class IdentificationAndJurisdictionBaseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  @Transform(({ value }) => StatesEnum[value])
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TribalDataEnum)
  localOrTribal?: TribalDataEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherLocalOrTribalDesc?: string;

  @ApiProperty({ required: true })
  @IsString()
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
  @Type(() => ExistingCompanyApplicantDto)
  applicant?: ExistingCompanyApplicantDto;

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
  docType: DocumentTypeEnum;

  @IsString()
  docNum: string;
}
