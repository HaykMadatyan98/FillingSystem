type ParticipantFormResponseKeys =
  | 'participantFormNotFound'
  | 'participantChanged'
  | 'participantDeleted'
  | 'participantCreated'
  | 'participantRetrieved';

export const participantFormResponseMsgs: Record<
  ParticipantFormResponseKeys,
  string
> = {
  participantFormNotFound: 'participant form not found',
  participantChanged: 'participant data was changed',
  participantDeleted: 'participant form succesfully deleted',
  participantCreated: 'participant form succesfully created',
  participantRetrieved: 'Participants retrieved successfully',
};
