export interface IResponseMessage {
  message: string;
  status?: number;
}

export const companyResponseMsgs: Record<string, IResponseMessage> = {
  csvUploadSuccessful: {
    message: 'Data is successfully saved',
  },
};
