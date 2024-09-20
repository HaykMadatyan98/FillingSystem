import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';

enum AddressTypeEnum {
  BUSINESS = 'business',
  RESIDENTIAL = 'residential',
}
// DTO for Beneficial Owner
class BeneficialOwnerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isParentOrGuard?: boolean;
}

// DTO for FinCENID (reusing the same DTO as in ApplicantForm)
class FinCENIDDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  finCENID?: string;
}

// DTO for Personal Information (reusing the same DTO as in ApplicantForm)
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
  @IsString()
  dateOfBirth?: Date;
}

// DTO for Address (reusing CurrentAddressDto)
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

// DTO for Exempt Entity
class ExemptEntityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  exemptEntity?: boolean;
}

// DTO for OwnerForm
export class CreateOwnerFormDto {
  @ApiProperty({ required: false })
  @IsOptional()
  beneficalOwner?: BeneficialOwnerDto;

  @ApiProperty({ required: false })
  @IsOptional()
  ownerFinCENId?: FinCENIDDto;

  @ApiProperty({ required: false })
  @IsOptional()
  exemptEntity?: ExemptEntityDto;

  @ApiProperty({ required: false })
  @IsOptional()
  personalInformation?: PersonalInformationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  residentalAddress?: CurrentAddressDto;
}
