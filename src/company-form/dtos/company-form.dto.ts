import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  AllCountryEnum,
  IdentificationTypesEnum,
  StatesEnum,
  TribalDataEnum,
  USTerritoryEnum,
} from '@/company/constants';
import { Type } from 'class-transformer';

class RepCompanyInfoDto {
  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  requestToReceiveFID?: boolean;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  foreignPooled?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

class LegalAndAltNamesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  altName?: string[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

class JurisdictionOfFormationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  countryOrJurisdictionOfFormation?: AllCountryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TribalDataEnum)
  tribalJurisdiction: TribalDataEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stateOfFormation: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  nameOfOtherTribal: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
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

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

class CreateLegalAndAltNamesDto {
  @ApiProperty({ required: true })
  @IsString()
  legalName: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  altName?: string[];
}

class TaxInformation {
  @ApiProperty({ required: true })
  @IsEnum(IdentificationTypesEnum)
  taxIdType: IdentificationTypesEnum;

  @ApiProperty({ required: true })
  @IsNumber()
  @Min(100_000_000)
  @Max(999_999_999)
  taxIdNumber: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  countryOrJurisdiction?: AllCountryEnum;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
export class ChangeCompanyFormDto {
  @ApiProperty({ type: RepCompanyInfoDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepCompanyInfoDto)
  repCompanyInfo?: RepCompanyInfoDto;

  @ApiProperty({ type: LegalAndAltNamesDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LegalAndAltNamesDto)
  names?: LegalAndAltNamesDto;

  @ApiProperty({ type: JurisdictionOfFormationDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => JurisdictionOfFormationDto)
  formationJurisdiction?: JurisdictionOfFormationDto;

  @ApiProperty({ type: TaxInformation, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TaxInformation)
  taxInfo?: TaxInformation;

  @ApiProperty({ type: CompanyAddressDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompanyAddressDto)
  address?: CompanyAddressDto;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  isExistingCompany: boolean;
}

export class CreateCompanyFormDto {
  @ApiProperty({ type: RepCompanyInfoDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepCompanyInfoDto)
  repCompanyInfo?: RepCompanyInfoDto;

  @ApiProperty({ type: LegalAndAltNamesDto })
  @ValidateNested({ each: true })
  @Type(() => CreateLegalAndAltNamesDto)
  names: CreateLegalAndAltNamesDto;

  @ApiProperty({ type: JurisdictionOfFormationDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => JurisdictionOfFormationDto)
  formationJurisdiction?: JurisdictionOfFormationDto;

  @ApiProperty({ type: TaxInformation })
  @ValidateNested({ each: true })
  @Type(() => TaxInformation)
  taxInfo: TaxInformation;

  @ApiProperty({ type: CompanyAddressDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompanyAddressDto)
  address?: CompanyAddressDto;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  isExistingCompany: boolean;
}

export class CSVCompanyFormDto {
  @ApiProperty({ type: RepCompanyInfoDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepCompanyInfoDto)
  repCompanyInfo?: RepCompanyInfoDto;

  @ApiProperty({ type: LegalAndAltNamesDto })
  @ValidateNested({ each: true })
  @Type(() => LegalAndAltNamesDto)
  names?: LegalAndAltNamesDto;

  @ApiProperty({ type: JurisdictionOfFormationDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => JurisdictionOfFormationDto)
  formationJurisdiction?: JurisdictionOfFormationDto;

  @ApiProperty({ type: TaxInformation })
  @ValidateNested({ each: true })
  @Type(() => TaxInformation)
  taxInfo: TaxInformation;

  @ApiProperty({ type: CompanyAddressDto, required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompanyAddressDto)
  address?: CompanyAddressDto;

  @ApiProperty({ type: Boolean, required: true })
  @IsBoolean()
  isExistingCompany: boolean;
}
