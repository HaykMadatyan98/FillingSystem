export interface IResponseMessage {
    message: string;
  }
  
  type UserResponseMsgKeys =
    | 'accountCreated'
    | 'userNotFound'
    | 'userChanged'
    | 'userDeleted'
    | 'userAlreadyExist'
    | 'userCreated';
  
  export const userResponseMsgs: Record<UserResponseMsgKeys, string> = {
    accountCreated: 'Account successfully created',
    userNotFound: 'User Not Found',
    userCreated: 'User successfully created',
    userChanged: 'User data has been changed',
    userDeleted: 'User successfully deleted',
    userAlreadyExist: 'User with that email is already exist',
  };
  