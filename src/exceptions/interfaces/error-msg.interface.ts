export interface IErrorDetail {
  message: string;
  status?: number;
  options?: {
    description?: string;
  };
}
