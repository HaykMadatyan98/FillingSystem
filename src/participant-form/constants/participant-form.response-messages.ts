type ParticipantFormResponseKeys =
  | 'participantFormNotFound'
  | 'participantChanged'
  | 'participantDeleted'
  | 'participantCreated';

export const participantFormResponseMsgs: Record<
  ParticipantFormResponseKeys,
  string
> = {
  participantFormNotFound: 'participant form not found',
  participantChanged: 'participant data was changed',
  participantDeleted: 'participant form succesfully deleted',
  participantCreated: 'participant form succesfully created',
};
