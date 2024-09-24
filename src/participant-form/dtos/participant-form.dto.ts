import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';

// DTO for Existing Company Applicant
class ExistingCompanyApplicantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isExistingCompany?: boolean;
}

// DTO for FinCENID
class FinCENIDDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  finCENID?: string;
}

// DTO for Personal Information
class PersonalInformationDto {
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

class BeneficialOwnerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isParentOrGuard?: boolean;
}

// Enum for Address Type
enum AddressTypeEnum {
  BUSINESS = 'business',
  RESIDENTIAL = 'residential',
}

// DTO for Current Address
class CurrentAddressDto {
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

// DTO for Identification and Jurisdiction
class IdentificationAndJurisdictionDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  docImg?: string;
}

// DTO for Exempt Entity
class ExemptEntityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isExemptEntity?: boolean;
}

// DTO for ApplicantForm
export class CreateParticipantFormDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  identificationDetails?: IdentificationAndJurisdictionDto;
}
