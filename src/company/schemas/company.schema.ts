import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import {
  ApplicantForm,
  OwnerForm,
} from '@/participant-form/schemas/participant-form.schema';
import { Transaction } from '@/transaction/schemas/transaction.schema';
import { User } from '@/user/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ _id: false })
class Forms {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'CompanyForm' })
  company: CompanyForm;

  @Prop({
    type: [MongoSchema.Types.ObjectId],
    ref: 'ParticipantForm',
    default: [],
  })
  applicants: ApplicantForm[];

  @Prop({
    type: [MongoSchema.Types.ObjectId],
    ref: 'ParticipantForm',
    default: [],
  })
  owners: OwnerForm[];
}

@Schema({ timestamps: true })
export class Company {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  answersCount: number;

  @Prop({ default: 0 })
  reqFieldsCount: number;

  @Prop({ default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) })
  expTime: Date;

  @Prop({ type: Forms })
  forms: Forms;

  @Prop({
    type: MongoSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  user: User;

  @Prop({ default: false })
  isSubmitted: boolean;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: [] })
  transactions: Transaction[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.index({ taxIdType: 1, taxIdNumber: 1 });
