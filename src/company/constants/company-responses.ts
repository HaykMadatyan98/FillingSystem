export interface IResponseMessage {
  message: string;
  status?: number;
}

export const companyResponseMsgs: Record<string, IResponseMessage> = {
  successfulLogin: {
    message: 'Sign-in successful.',
  },
  otpWasSent: {
    message: 'One-time password sent.',
  },
  accountCreated: {
    message: 'Account successfully created',
  },
};
