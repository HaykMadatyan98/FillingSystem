export enum ExpirationTimes {
  ACCESS_TOKEN = '1h',
  REFRESH_TOKEN = '24h',
}

export const userVerificationTime = [1, 'hour'];

export {
  authResponseMsgs,
  IResponseMessage,
  ILoginResponse,
} from './auth-responses';

export enum Role {
  Admin = 'admin',
  User = 'user',
}
