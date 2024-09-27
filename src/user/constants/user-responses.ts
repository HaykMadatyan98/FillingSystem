export interface IResponseMessage {
  message: string;
  status?: number;
  options?: {
    description?: string;
  };
}
export const userResponseMsgs: Record<string, IResponseMessage> = {
  accountCreated: {
    message: 'Account successfully created',
  },
  userNotFound: {
    message: 'User Not Found',
  },
};
