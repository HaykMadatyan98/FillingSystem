import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OwnerFormDocument = OwnerForm & Document;
export type ApplicantFormDocument = ApplicantForm & Document;

@Schema({ _id: false })
class BeneficialOwner {
  @Prop()
  isParentOrGuard: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class ExistingCompanyApplicant {
  @Prop()
  isExistingCompany: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class FinCENID {
  @Prop()
  finCENID: string;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class PersonalInformation {
  @Prop()
  lastOrLegalName: string;

  @Prop()
  firstName: string;

  @Prop()
  middleName: string;

  @Prop()
  suffix: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class OwnerAddress {
  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  countryOrJurisdiction: string;

  @Prop()
  state: string;

  @Prop()
  postalCode: string;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class ApplicantAddress extends OwnerAddress {
  @Prop({ required: true })
  type: string;
}

@Schema({ _id: false })
class IdentificationAndJurisdiction {
  @Prop()
  docType: string;

  @Prop()
  docNumber: string;

  @Prop()
  countryOrJurisdiction: string;

  @Prop()
  state: string;

  @Prop()
  localOrTribal: string;

  @Prop()
  otherLocalOrTribalDesc: string;

  @Prop()
  docImg: string;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ _id: false })
class ExemptEntity {
  @Prop()
  isExemptEntity: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

@Schema({ timestamps: true })
export class ApplicantForm {
  @Prop({ required: false })
  applicant: ExistingCompanyApplicant;

  @Prop()
  finCENID: FinCENID;

  @Prop()
  personalInfo: PersonalInformation;

  @Prop()
  address: ApplicantAddress;

  @Prop()
  identificationDetails: IdentificationAndJurisdiction;

  @Prop()
  answerCount: number;
}

@Schema({ timestamps: true })
export class OwnerForm {
  @Prop({ required: false })
  exemptEntity: ExemptEntity;

  @Prop()
  beneficialOwner: BeneficialOwner;

  @Prop()
  finCENID: FinCENID;

  @Prop()
  personalInfo: PersonalInformation;

  @Prop()
  address: OwnerAddress;

  @Prop()
  identificationDetails: IdentificationAndJurisdiction;

  @Prop()
  answerCount: number;
}

export const OwnerFormSchema = SchemaFactory.createForClass(OwnerForm);
OwnerFormSchema.index(
  { 'finCENID.finCENID': 1 },
  { partialFilterExpression: { 'finCENID.finCENID': { $exists: true } } },
);
OwnerFormSchema.index(
  { 'identificationDetails.docType': 1, 'identificationDetails.docNumber': 1 },
  { partialFilterExpression: { 'finCENID.finCENID': { $exists: false } } },
);

export const ApplicantFormSchema = SchemaFactory.createForClass(ApplicantForm);
ApplicantFormSchema.index(
  { 'finCENID.finCENID': 1 },
  { partialFilterExpression: { 'finCENID.finCENID': { $exists: true } } },
);
ApplicantFormSchema.index(
  { 'identificationDetails.docType': 1, 'identificationDetails.docNumber': 1 },
  { partialFilterExpression: { 'finCENID.finCENID': { $exists: false } } },
);
