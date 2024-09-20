import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicantFormDocument = ApplicantForm & Document;
export type OwnerFormDocument = OwnerForm & Document;

enum AddressTypeEnum {
  BUSINESS = 'business',
  RESIDENTIAL = 'residential',
}

@Schema({ _id: false })
class BeneficialOwner {
  @Prop()
  isParentOrGuard: boolean;
}

@Schema({ _id: false })
class Image {
  @Prop()
  blobId: string;

  @Prop()
  blobUrl: string;

  @Prop()
  fileName: string;

  @Prop()
  size: number;

  @Prop()
  format: string;
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
class CurrentAddress {
  @Prop({ enum: AddressTypeEnum })
  type: AddressTypeEnum;

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
  docImg: Image;
}

@Schema({ _id: false })
class ExemptEntity {
  @Prop()
  isExemptEntity: boolean;
}

@Schema({ timestamps: true })
export class ApplicantForm {
  @Prop()
  applicant: ExistingCompanyApplicant;

  @Prop()
  applicantFinCENID: FinCENID;

  @Prop()
  personalInfo: PersonalInformation;

  @Prop()
  address: CurrentAddress;

  @Prop()
  identificationDetails: IdentificationAndJurisdiction;
}

@Schema({ timestamps: true })
export class OwnerForm {
  @Prop()
  beneficalOwner: BeneficialOwner;

  @Prop()
  ownerFinCENID: FinCENID;

  @Prop()
  exemptEntity: ExemptEntity;

  @Prop()
  personalInfo: PersonalInformation;

  @Prop()
  residentialAddress: CurrentAddress;

  @Prop()
  identificationDetails: IdentificationAndJurisdiction;
}

export const OwnerFormSchema = SchemaFactory.createForClass(OwnerForm);
export const ApplicantFormSchema = SchemaFactory.createForClass(ApplicantForm);
