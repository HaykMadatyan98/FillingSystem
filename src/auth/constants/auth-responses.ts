export interface IResponseMessage {
  message: string;
  status?: number;
}

export interface ILoginResponse {
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export const authResponseMsgs: Record<string, IResponseMessage> = {
  successfulLogin: {
    message: 'Sign-in successful.',
  },
  otpWasSent: {
    message: 'One-time password sent.',
  },
};
