export interface IResponseMessage {
  message: string;
}

export interface ILoginResponse {
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}

type AuthResponseKeys =
  | 'successfulLogin'
  | 'otpWasSent'
  | 'wrongSendedEmailOrPass'
  | 'userNotFound'
  | 'tokenRefreshed'
  | 'codeWasExpired'
  | 'accessDenied'
  | 'expiredRefreshToken'
  | 'tokenPayloadMissingFields'
  | 'successfullLogout'
  | 'tokenIsMissing'
  | 'accessTokenExpired';

export const authResponseMsgs: Record<AuthResponseKeys, string> = {
  successfulLogin: 'Sign-in successful',
  otpWasSent: 'One-time password sent.',
  tokenRefreshed: 'Token succesfully updated',
  successfullLogout: 'Succesfully signed out',
  // errors
  wrongSendedEmailOrPass: 'Email or Password was not correct',
  tokenIsMissing: 'No Token provided',
  userNotFound: 'User Not Found',
  codeWasExpired: 'Current Code was Expired',
  accessDenied: 'Access Denied',
  accessTokenExpired: 'Invalid or expired access token',
  expiredRefreshToken: 'Invalid or expired refresh token',
  tokenPayloadMissingFields: 'Token payload is missing required fields',
};
