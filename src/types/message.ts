import { Participant } from 'src/types/participant';

export type Message = {
  sender: Participant;
  content: string;
  translatedContent?: string;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
};
