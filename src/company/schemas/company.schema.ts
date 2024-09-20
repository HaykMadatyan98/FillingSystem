import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import {
  OwnerForm,
  ApplicantForm,
} from '@/owner-applicant-form/schemas/owner-applicant-form.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ _id: false })
class Forms {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'CompanyForm' })
  company: CompanyForm;

  @Prop({ type: [MongoSchema.Types.ObjectId], ref: 'ApplicantForm' })
  applicants: ApplicantForm[];

  @Prop({ type: [MongoSchema.Types.ObjectId], ref: 'OwnerForm' })
  owners: OwnerForm[];
}

@Schema()
export class Company {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  answerCount: number;

  @Prop({ default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) })
  expTime: Date;

  @Prop({ type: Forms })
  forms: Forms;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
