import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Public } from 'src/common/decorators';
import { Participant } from 'src/types/participant';
import { CreateRoomDto } from './dtos';
import { Room } from './schemas/room.schema';
@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
  ) {}
  @Public()
  async createRoom(createRoomDto: CreateRoomDto) {
    const newRoom = new this.roomModel();
    newRoom.code = createRoomDto.code;
    newRoom.hostSocketId = createRoomDto.hostSocketId;
    const room = await this.roomModel.create(newRoom);
    return room;
  }

  async joinRoom(code: string, participant: Participant) {
    const newRoom = await this.roomModel.findOne({ code });

    if (!newRoom) {
      throw new Error('Room not found');
    }
    const isExist = newRoom.participants.find(
      (p) => p.socketId === participant.socketId,
    );
    if (isExist) {
      throw new Error('User already joined');
    }
    newRoom.participants.push(participant);
    await newRoom.save();
    return newRoom;
  }

  async leaveRoom(code: string, socketId: string) {
    const room = await this.roomModel.findOne({
      code,
    });
    if (!room) {
      throw new Error('Room not found');
    }
    const participantIndex = room.participants.findIndex(
      (p) => p.socketId === socketId,
    );
    if (participantIndex === -1) {
      throw new Error('User has not joined');
    }
    room.participants.splice(participantIndex, 1);
    if (!room.participants.length) {
      await room.deleteOne();
      return room;
    }
    await room.save();
    return room;
  }

  async leaveAllRooms(socketId: string) {
    const rooms = await this.roomModel.find({
      'participants.socketId': socketId,
    });
    if (!rooms.length) {
      throw new Error('User has not joined any room');
    }
    rooms.forEach((room) => {
      const participantIndex = room.participants.findIndex(
        (p) => p.socketId === socketId,
      );
      room.participants.splice(participantIndex, 1);
      if (!room.participants.length) {
        room.deleteOne();
        return;
      }
      room.save();
    });
    return rooms;
  }
}
