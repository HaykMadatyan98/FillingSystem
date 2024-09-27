import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsEnum,
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

export class CurrentAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AddressTypeEnum)
  type?: AddressTypeEnum;

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
  @IsString()
  countryOrJurisdiction?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class IdentificationAndJurisdictionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  docType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  docNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrJurisdiction?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localOrTribal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherLocalOrTribalDesc?: string;
}

export class ExemptEntityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isExemptEntity?: boolean;
}

export class IdentificationAndJurisdictionForCreateDto {
  @ApiProperty({ required: true })
  @IsString()
  docType: string;

  @ApiProperty({ required: true })
  @IsString()
  docNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrJurisdiction?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localOrTribal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherLocalOrTribalDesc?: string;
}

export class BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  applicant?: ExistingCompanyApplicantDto;

  @ApiProperty({ required: false })
  @IsOptional()
  beneficialOwner?: BeneficialOwnerDto;

  @ApiProperty({ required: false })
  @IsOptional()
  finCENID?: FinCENIDDto;

  @ApiProperty({ required: false })
  @IsOptional()
  exemptEntity?: ExemptEntityDto;

  @ApiProperty({ required: false })
  @IsOptional()
  personalInfo?: PersonalInformationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: CurrentAddressDto;

  // @ApiProperty({ required: true })
  // @IsBoolean()
  // isApplicant?: boolean;
}

export class ChangeParticipantFormDto extends BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  identificationDetails?: IdentificationAndJurisdictionDto;
}

export class CreateParticipantFormDto extends BaseParticipantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  identificationDetails: IdentificationAndJurisdictionForCreateDto;
}
