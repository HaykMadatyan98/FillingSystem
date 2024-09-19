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
  existingReportCompany?: boolean;
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
  firstname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middlename?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;
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

// DTO for Image
class ImageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  blobId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  blobUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  format?: string;
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
  docImg?: ImageDto;
}

// DTO for ApplicantForm
export class CreateApplicantFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  applicant?: ExistingCompanyApplicantDto;

  @ApiProperty({ required: false })
  @IsOptional()
  applicantFinCENID?: FinCENIDDto;

  @ApiProperty({ required: false })
  @IsOptional()
  personalInformation?: PersonalInformationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  currentAddress?: CurrentAddressDto;

  @ApiProperty({ required: false })
  @IsOptional()
  identificationAndJurisdiction?: IdentificationAndJurisdictionDto;
}
