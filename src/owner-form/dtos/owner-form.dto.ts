import {
  AllCountryEnum,
  DocumentTypeEnum,
  StatesEnum,
  TribalDataEnum,
} from '@/company/constants';
import {
  CountryStateValidator,
  IsCountryOrJurisdictionValid,
  IsLocalOrTribalValid,
  IsOtherLocalOrTribalDescValid,
  IsStateValid,
  PostalCodeValidator,
} from '@/utils/validateCountry.util';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PersonalInformationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lastOrLegalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  suffix?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;
}

export class PersonalInformationCSVDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lastOrLegalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
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

class OwnerAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  @Transform(({ value }) => AllCountryEnum[value] || value)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @CountryStateValidator()
  @Transform(({ value }) =>
    value === '' ? undefined : StatesEnum[value] || value,
  )
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @PostalCodeValidator()
  postalCode?: string;
}

class IdentificationAndJurisdictionBaseDto {
  @ApiProperty({ required: true })
  @IsEnum(DocumentTypeEnum)
  @Transform(({ value }) => DocumentTypeEnum[value] || value)
  docType: DocumentTypeEnum;

  @ApiProperty({ required: true })
  @IsString()
  @MaxLength(25)
  docNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsCountryOrJurisdictionValid({
    message: 'Invalid country or jurisdiction for the selected docType',
  })
  @Transform(({ value }) => AllCountryEnum[value] || value)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsStateValid({
    message:
      'Invalid state for the selected docType and countryOrJurisdiction.',
  })
  @Transform(({ value }) =>
    value === '' ? undefined : StatesEnum[value] || value,
  )
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLocalOrTribalValid({
    message:
      'Invalid localOrTribal field for the selected docType and countryOrJurisdiction.',
  })
  @Transform(({ value }) =>
    value === '' ? undefined : TribalDataEnum[value] || value,
  )
  localOrTribal?: TribalDataEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @IsOtherLocalOrTribalDescValid({
    message:
      'The otherLocalOrTribalDesc field is only allowed when docType is "State/local/tribe-issued ID", countryOrJurisdiction is "United States of America", and localOrTribal is "Other".',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  otherLocalOrTribalDesc?: string;
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
  @Type(() => PersonalInformationDto)
  personalInfo?: PersonalInformationDto;

  @ApiProperty({ required: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IdentificationAndJurisdictionBaseDto)
  identificationDetails: IdentificationAndJurisdictionBaseDto;
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

export class CSVOwnerFormDto extends OwnerFormDto {
  @ApiProperty({ required: true })
  @ValidateNested({ each: true })
  @Type(() => CSVIdentificationAndJurisdictionDto)
  identificationDetails: CSVIdentificationAndJurisdictionDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PersonalInformationCSVDto)
  personalInfo?: PersonalInformationCSVDto;
}

export class CreateParticipantDocDto {
  @IsEnum(DocumentTypeEnum)
  @Transform(({ value }) => AllCountryEnum[value] || value)
  ['identificationDetails.docType']: DocumentTypeEnum;

  @IsString()
  @MaxLength(25)
  ['identificationDetails.docNumber']: string;
}
