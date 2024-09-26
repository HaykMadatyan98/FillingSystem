export interface IResponseMessage {
  message: string;
  status?: number;
}

export const companyResponseMsgs: Record<string, IResponseMessage> = {
  csvUploadSuccesfull: {
    message: 'Data is succesfully saved',
  },
};
