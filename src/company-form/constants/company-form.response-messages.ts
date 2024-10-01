export interface IResponseMessage {
  message: string;
}

type CompanyFormResponseMsgKeys = 'companyFormNotFound';

export const companyFormResponseMsgs: Record<
  CompanyFormResponseMsgKeys,
  string
> = {
  companyFormNotFound: 'Company form is not found',
};
