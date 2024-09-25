import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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
  legalName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  altName?: string;
}

class TaxInformation {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxIdType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxIdNumber?: string;

  // add regexp
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrJurisdiction?: string;
}

class JurisdictionOfFormationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrJurisdictionOfFormation?: string;
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
  @IsString()
  usOrUsTerritory?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class CompanyFormDto {
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
