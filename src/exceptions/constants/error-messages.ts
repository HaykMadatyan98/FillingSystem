import { IErrorDetail } from '../interfaces/error-msg.interface';

export const errorMessages: Record<string, IErrorDetail> = {
  wrongSendedEmailOrPass: {
    message: 'Email or Password was not correct',
    options: {
      description: "Sended Email or One time password doesn't match",
    },
  },
  userNotFound: {
    message: 'User Not Found',
  },
};
