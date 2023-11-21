import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;
export enum RoomStatus {
  ACTIVE = 'active',
  TEMPORARY = 'temporary',
  DELETED = 'deleted',
  CANNOT_MESSAGE = 'cannot_message',
}
class Participant {
  @Prop({ type: String })
  socketId: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  color: string;
}
@Schema({
  timestamps: true,
})
export class Room {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String })
  code: string;

  @Prop()
  host: Participant;

  @Prop({ type: [String] })
  languages: string[];
  @Prop()
  participants: {
    socketId: string;
    username: string;
    color: string;
    language: string;
  }[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
