import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportingCompanyDocument = ReportingCompany & Document;

@Schema()
export class ReportingCompany {
  @Prop({ required: true })
  name: {
    legalName: string;
    alternateName?: string;
  };

  @Prop({ required: true })
  taxInformation: {
    taxIdentificationType: string;
    taxIdentificationNumber: string;
    countryJurisdiction?: string;
  };

  @Prop({ required: true })
  countryJurisdictionOfFormation: string;

  @Prop({ required: true })
  address: {
    address: string;
    city: string;
    usOrUsTerritory: boolean;
    state: string;
    zipCode: string;
  };
}

export const ReportingCompanySchema =
  SchemaFactory.createForClass(ReportingCompany);
