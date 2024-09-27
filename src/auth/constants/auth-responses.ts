export interface IResponseMessage {
  message: string;
  status?: number;
  options?: {
    description?: string;
  };
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
  wrongSendedEmailOrPass: {
    message: 'Email or Password was not correct',
    options: {
      description: "Sended Email or One time password doesn't match",
    },
  },
  userNotFound: {
    message: 'User Not Found',
  },
  tokenRefreshed: {
    message: 'Token succesfully updated',
  },
};
