import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OwnerFormDocument = OwnerForm & Document;
export type ApplicantFormDocument = ApplicantForm & Document;

@Schema({ _id: false })
class BeneficialOwner {
  @Prop()
  isParentOrGuard: boolean;
}

@Schema({ _id: false })
class ExistingCompanyApplicant {
  @Prop()
  isExistingCompany: boolean;
}

@Schema({ _id: false })
class FinCENID {
  @Prop()
  finCENID: string;
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
}

@Schema({ _id: false })
class ExemptEntity {
  @Prop()
  isExemptEntity: boolean;
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

export const ApplicantFormSchema = SchemaFactory.createForClass(ApplicantForm);
