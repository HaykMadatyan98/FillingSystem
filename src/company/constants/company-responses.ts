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
  | 'companyWasCreated'
  | 'companyNameMissing'
  | 'csvFileIsMissing';

export const companyResponseMsgs: Record<CompanyResponseMsgKeys, string> = {
  csvUploadSuccessful: 'Data is successfully saved',
  companyNotFound: 'Company Not found',
  companyCreated: 'Company successfully created',
  companyChanged: 'Company data was changed',
  companyDeleted: 'Company successfully deleted',
  dontHavePermission: 'You do not have permission to perform this action.',
  companyWasCreated: 'Company with that tax Id Number was already created',
  companyNameMissing: 'Company Nam is Required',
  csvFileIsMissing: 'Csv file is not detected',
};
