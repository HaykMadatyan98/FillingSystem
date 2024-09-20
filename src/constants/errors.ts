interface ErrorDetail {
  message: string;
  description?: string; 
  status?: number;
}

export const ErrorMessages: Record<string, ErrorDetail> = {
  invalidOtp: {
    message: 'Invalid OTP',
    description: 'The one-time password provided is incorrect.',
    status: 400,
  },
  UserWithEnteredEmailNotFound: {
    message: 'User not Found',
    description: 'The user with the provided email address does not exist',
  },
};
