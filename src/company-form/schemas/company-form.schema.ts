import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyFormDocument = CompanyForm & Document;

@Schema({ _id: false })
class RepCompanyInfo {
  @Prop({ default: false })
  requestToReceiveFID: boolean;

  @Prop({ default: false })
  foreignPooled: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class LegalAndAltNames {
  @Prop({ required: true })
  legalName: string;

  @Prop()
  altName: string[];

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class TaxInformation {
  @Prop({ required: true })
  taxIdType: string;

  @Prop({ required: true })
  taxIdNumber: string;

  @Prop()
  countryOrJurisdiction: string;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class JurisdictionOfFormation {
  @Prop()
  countryOrJurisdictionOfFormation: string;

  @Prop({ required: false })
  stateOfFormation: string;

  @Prop({ required: false })
  tribalJurisdiction: string;

  @Prop({ required: false })
  nameOfOtherTribal: string;

  @Prop({ default: false })
  isVerified: boolean;
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

  @Prop({ default: false })
  isVerified: boolean;
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

  @Prop({ default: 0 })
  answerCount: number;
}

export const CompanyFormSchema = SchemaFactory.createForClass(CompanyForm);
CompanyFormSchema.index({ 'taxInfo.taxIdType': 1, 'taxInfo.taxIdNumber': 1 });
