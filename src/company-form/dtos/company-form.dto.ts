import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  IdentificationTypesEnum,
  CountryEnum,
  StatesEnum,
  USTerritoryEnum,
} from '@/company/constants';

class RepCompanyInfoDto {
  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  requestToReceiveFID?: boolean;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  foreignPooled?: boolean;
}

class LegalAndAltNamesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altName?: string;
}

class TaxInformation {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(IdentificationTypesEnum)
  taxIdType?: IdentificationTypesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1_000_000_000)
  @Max(9_999_999_999)
  taxIdNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CountryEnum)
  countryOrJurisdiction?: CountryEnum;
}
class JurisdictionOfFormationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CountryEnum)
  countryOrJurisdictionOfFormation?: CountryEnum;
}

class CompanyAddressDto {
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
  @IsEnum(USTerritoryEnum)
  usOrUsTerritory?: USTerritoryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(9)
  zipCode?: string;
}

export class ChangeCompanyFormDto {
  @ApiProperty({ type: RepCompanyInfoDto, required: false })
  @IsOptional()
  repCompanyInfo?: RepCompanyInfoDto;

  @ApiProperty({ type: LegalAndAltNamesDto, required: false })
  @IsOptional()
  names?: LegalAndAltNamesDto;

  @ApiProperty({ type: JurisdictionOfFormationDto, required: false })
  @IsOptional()
  formationJurisdiction?: JurisdictionOfFormationDto;

  @ApiProperty({ type: TaxInformation, required: false })
  @IsOptional()
  taxInfo?: TaxInformation;

  @ApiProperty({ type: CompanyAddressDto, required: false })
  @IsOptional()
  address?: CompanyAddressDto;
}

class CreateLegalAndAltNamesDto {
  @ApiProperty({ required: true })
  @IsString()
  legalName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  altName?: string;
}

class CreateTaxInformation {
  @ApiProperty({ required: true })
  @IsOptional()
  @IsEnum(IdentificationTypesEnum)
  taxIdType?: IdentificationTypesEnum;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  @Min(1_000_000_000)
  @Max(9_999_999_999)
  taxIdNumber: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CountryEnum)
  countryOrJurisdiction?: CountryEnum;
}

export class CreateCompanyFormDto {
  @ApiProperty({ type: RepCompanyInfoDto, required: false })
  @IsOptional()
  repCompanyInfo?: RepCompanyInfoDto;

  @ApiProperty({ type: LegalAndAltNamesDto })
  names: CreateLegalAndAltNamesDto;

  @ApiProperty({ type: JurisdictionOfFormationDto, required: false })
  @IsOptional()
  formationJurisdiction?: JurisdictionOfFormationDto;

  @ApiProperty({ type: TaxInformation })
  taxInfo: CreateTaxInformation;

  @ApiProperty({ type: CompanyAddressDto, required: false })
  @IsOptional()
  address?: CompanyAddressDto;
}
