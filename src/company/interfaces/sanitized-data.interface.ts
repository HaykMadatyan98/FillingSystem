import { ICompanyForm } from '@/company-form/interfaces';
import { IChangeParticipantForm } from '@/participant-form/interfaces';

export interface ISanitizedData {
  company: ICompanyForm;
  participants: Array<IChangeParticipantForm>;
}
