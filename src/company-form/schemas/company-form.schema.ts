import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyFormDocument = CompanyForm & Document;

@Schema({ _id: false })
class RepCompanyInfo {
  @Prop({ default: false })
  requestToReceiveFID: boolean;

  @Prop({ default: false })
  foreignPooled: boolean;
}

@Schema({ _id: false })
class LegalAndAltNames {
  @Prop({ required: true })
  legalName: string;

  @Prop()
  altName: string;
}

@Schema({ _id: false })
class TaxInformation {
  @Prop({ required: true })
  taxIdType: string;

  @Prop({ required: true })
  taxIdNumber: number;

  @Prop()
  countryOrJurisdiction: string;
}

@Schema({ _id: false })
class JurisdictionOfFormation {
  @Prop()
  countryOrJurisdictionOfFormation: string;
}

@Schema({ _id: false })
class CompanyAddress {
  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  usOrUsTerritory: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;
}

@Schema({ timestamps: true })
export class CompanyForm {
  @Prop()
  repCompanyInfo: RepCompanyInfo;

  @Prop()
  names: LegalAndAltNames;

  @Prop()
  formationJurisdiction: JurisdictionOfFormation;

  @Prop()
  taxInfo: TaxInformation;

  @Prop()
  address: CompanyAddress;
}

export const CompanyFormSchema = SchemaFactory.createForClass(CompanyForm);
