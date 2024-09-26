import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParticipantFormDocument = ParticipantForm & Document;

// enum AddressTypeEnum {
//   BUSINESS = 'business',
//   RESIDENTIAL = 'residential',
// }

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
class CurrentAddress {
  @Prop({ required: false })
  type: string;

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

  @Prop({ required: false })
  business_address: string;

  @Prop({ required: false })
  business_city: string;

  @Prop({ required: false })
  business_countryOrJurisdiction: string;

  @Prop({ required: false })
  business_state: string;

  @Prop({ required: false })
  business_postalCode: string;
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
export class ParticipantForm {
  @Prop({ required: false })
  applicant: ExistingCompanyApplicant;

  @Prop({ required: false })
  exemptEntity: ExemptEntity;

  @Prop()
  beneficialOwner: BeneficialOwner;

  @Prop()
  finCENID: FinCENID;

  @Prop()
  personalInfo: PersonalInformation;

  @Prop()
  address: CurrentAddress;

  @Prop()
  identificationDetails: IdentificationAndJurisdiction;
}

export const ParticipantFormSchema =
  SchemaFactory.createForClass(ParticipantForm);
