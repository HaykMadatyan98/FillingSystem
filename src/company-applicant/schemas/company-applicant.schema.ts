import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyApplicantDocument = CompanyApplicant & Document;

@Schema()
export class CompanyApplicant {
  @Prop({ required: true })
  personalInformation: {
    lastName: string;
    firstName: string;
    middleName?: string;
    suffix?: string;
    dateOfBirth: Date;
  };

  @Prop({ required: true })
  address: {
    addressType: string;
    address: string;
    city: string;
    countryJurisdiction: string;
    state?: string;
    zipOrPostalCode: string;
  };

  @Prop({ required: true })
  taxInformation: {
    identifyingDocumentType: string;
    identifyingDocumentNumber: string;
    identifyingDocumentIssuingJurisdiction: {
      countryJurisdiction?: string;
      state?: string;
      localTribal?: string;
      otherLocalTribalDescription?: string;
    };
    identifyingDocumentImage: string;
  };
}

export const CompanyApplicantSchema =
  SchemaFactory.createForClass(CompanyApplicant);
