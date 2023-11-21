import { Message } from 'src/types/message';

export type NewMessagePayload = {
  roomId: string;
  message: Message;
  clientTempId: string;
};
