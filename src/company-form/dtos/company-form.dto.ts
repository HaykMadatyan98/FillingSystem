import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  AllCountryEnum,
  IdentificationTypesEnum,
  StatesEnum,
  TribalDataEnum,
  USTerritoryEnum,
} from '@/company/constants';
import { IsTaxIdValid } from '@/utils/taxId.validator';
import { Transform, Type } from 'class-transformer';

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
  @MaxLength(150)
  legalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  @Type(() => String)
  @Transform(({ value }) => (value && value.length === 0 ? undefined : value), {
    toClassOnly: true,
  })
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
  @Transform(({ value }) =>
    value === '' ? undefined : TribalDataEnum[value] || value,
  )
  tribalJurisdiction: TribalDataEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  @Transform(({ value }) =>
    value === '' ? undefined : StatesEnum[value] || value,
  )
  stateOfFormation: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (value === '' ? undefined : value))
  nameOfOtherTribal: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

class CompanyAddressDto {
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
  @IsEnum(USTerritoryEnum)
  usOrUsTerritory?: USTerritoryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StatesEnum)
  @Transform(({ value }) => StatesEnum[value] || value)
  state?: StatesEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
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
  @MaxLength(150)
  legalName: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  @Type(() => String)
  altName?: string[];
}

class TaxInformation {
  @ApiProperty({ required: true })
  @IsEnum(IdentificationTypesEnum)
  taxIdType: IdentificationTypesEnum;

  @ApiProperty({ required: true })
  @IsString()
  @ValidateIf((o) => o.taxIdType)
  @IsTaxIdValid()
  taxIdNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AllCountryEnum)
  @Transform(({ value }) =>
    value === '' ? undefined : AllCountryEnum[value] || value,
  )
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
