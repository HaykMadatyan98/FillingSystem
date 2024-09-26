import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import { ParticipantForm } from '@/participant-form/schemas/participant-form.schema';
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
  applicants: ParticipantForm[];

  @Prop({
    type: [MongoSchema.Types.ObjectId],
    ref: 'ParticipantForm',
    default: [],
  })
  owners: ParticipantForm[];
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

  @Prop({ default: [], type: MongoSchema.Types.ObjectId, ref: 'User' })
  users: User[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
