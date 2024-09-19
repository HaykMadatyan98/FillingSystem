import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import {
  OwnerForm,
  ApplicantForm,
} from '@/owner-applicant-form/schemas/owner-applicant-form.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type ReportingCompanyDocument = Company & Document;

@Schema({ _id: false })
class Forms {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'CompanyForm' })
  company: CompanyForm;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'ApplicantForm' })
  applicants: ApplicantForm[];

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'OwnerForm' })
  owner: OwnerForm[];
}

@Schema()
export class Company {
  @Prop()
  name: string;

  @Prop()
  answerCount: number;

  @Prop()
  expTime: Date;

  @Prop()
  forms: Forms;
}

export const ReportingCompanySchema = SchemaFactory.createForClass(Company);
