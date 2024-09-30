import { Request } from 'express';
import { ObjectId } from 'mongoose';

enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}
export interface RequestWithUser extends Request {
  user?: {
    email: string;
    role: RoleEnum;
    id: string | ObjectId;
  };
}
