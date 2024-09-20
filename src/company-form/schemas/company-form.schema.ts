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
  @Prop()
  legalName: string;

  @Prop()
  altName: string;
}

@Schema({ _id: false })
class IdentifyForm {
  @Prop()
  taxType: string;

  @Prop()
  taxNumber: number;

  @Prop()
  countryOrJurisdiction: string;
}

@Schema({ _id: false })
class JurisdictionOfFormation {
  @Prop()
  countryOrJurisdiction: string;
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
  identifyForm: IdentifyForm;

  @Prop()
  address: CompanyAddress;
}

export const CompanyFormSchema = SchemaFactory.createForClass(CompanyForm);
