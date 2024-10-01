export interface IResponseMessage {
  message: string;
}

type CompanyResponseMsgKeys =
  | 'csvUploadSuccessful'
  | 'companyNotFound'
  | 'companyCreated'
  | 'companyChanged'
  | 'companyDeleted'
  | 'dontHavePermission'
  | 'companyWasCreated';

export const companyResponseMsgs: Record<CompanyResponseMsgKeys, string> = {
  csvUploadSuccessful: 'Data is successfully saved',
  companyNotFound: 'Company Not found',
  companyCreated: 'Company succesfully created',
  companyChanged: 'Company data was changed',
  companyDeleted: 'Company succefully deleted',
  dontHavePermission: 'You do not have permission to perform this action.',
  companyWasCreated: 'Company with that tax Id Number was already created',
};
