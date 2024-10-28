import { StatesEnum } from '@/company/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MailDocument = Mail & Document;

@Schema({ _id: false })
class EmailBody {
  @Prop({ required: true })
  sendTime: Date;

  @Prop({ enum: StatesEnum })
  status: StatesEnum;

  @Prop()
  reason?: string;
}

@Schema({ timestamps: true })
export class Mail {
  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  oneTimePass: EmailBody[];

  @Prop({ type: [EmailBody], required: false })
  fillingNotifications: EmailBody[];

  @Prop({ type: [EmailBody], required: false })
  changeNotifications: EmailBody[];

  @Prop({ type: [EmailBody], required: false })
  warningNotifications: EmailBody[];

  @Prop({ type: [EmailBody], required: false })
  adminNotifications: EmailBody[];
}

export const mailSchema = SchemaFactory.createForClass(Mail);
