export interface IResponseMessage {
  message: string;
  status?: number;
}

export const userResponseMsgs: Record<string, IResponseMessage> = {
  accountCreated: {
    message: 'Account succesfully created',
  },
};
