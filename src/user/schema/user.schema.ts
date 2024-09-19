import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: true, enum: RoleEnum, default: 'user' })
  role: string;

  @Prop({ default: null })
  oneTimePass: number | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
