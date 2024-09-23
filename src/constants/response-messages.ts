interface ResponseMessage {
  message: string;
  status?: number;
}

export const ResponseMessages: Record<string, ResponseMessage> = {
  successfulLogin: {
    message: 'Sign-in successful.',
    status: 200,
  },
  otpWasSent: {
    message: 'One-time password sent.',
    status: 200,
  },
};
