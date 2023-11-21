import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { socketConfig } from 'src/configs/socket.config';
import { RoomsService } from 'src/rooms/rooms.service';
import { Message } from 'src/types/message';
import { Participant } from 'src/types/participant';
export type SendMessagePayload = {
  roomCode: string;
  message: Pick<Message, 'content' | 'translatedContent'>;
};

@WebSocketGateway({ cors: '*' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly roomsService: RoomsService) {}

  @WebSocketServer()
  public server: Server;
  private clients: {
    [key: string]: {
      socketIds: string[];
    };
  } = {};
  afterInit(server: Server) {
    console.log('socket ', server?.engine?.clientsCount);
    // console.log('socket ', server?.engine?.clientsCount);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('socket ', client?.id);
  }
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const rooms = await this.roomsService.leaveAllRooms(client.id);
      rooms.forEach((room) => {
        const newMessage = createSystemMessage(
          `${client.handshake.query.username} has left the conversation`,
        );
        client.to(room.code).emit(socketConfig.events.message.new, newMessage);
        client
          .to(room.code)
          .emit(socketConfig.events.room.participant.update, room.participants);
        client.leave(room.code);
      });
    } catch (error) {}
  }

  @SubscribeMessage('client.join')
  joinAdminRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    console.log('client.join', userId);
    client.join(userId.toString());
    this.clients[userId.toString()] = {
      socketIds: [
        ...(this.clients[userId.toString()]?.socketIds || []),
        client.id,
      ],
    };
  }

  @SubscribeMessage(socketConfig.events.room.join)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomCode, info }: { roomCode: string; info: any },
  ) {
    client.join(roomCode);
    client.handshake.query = {
      ...client.handshake.query,
      ...info,
    };
    const newUser: Participant = {
      ...info,
      socketId: client.id,
    };
    try {
      const room = await this.roomsService.joinRoom(roomCode, newUser);
      // send room info only to new user
      client.emit(socketConfig.events.room.join, room);
      // send new user info to all other users
      client
        .to(roomCode)
        .emit(socketConfig.events.room.participant.update, room.participants);
      // system message
      const newMessage = createSystemMessage(
        `${newUser.username} has joined the conversation`,
      );
      client.to(roomCode).emit(socketConfig.events.message.new, newMessage);
    } catch (error) {}
  }
  @SubscribeMessage(socketConfig.events.room.leave)
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomCode: string,
  ) {
    // send system message
    try {
      const room = await this.roomsService.leaveRoom(roomCode, client.id);
      const newMessage = createSystemMessage(
        `${client.handshake.query.username} has left the conversation`,
      );
      client.to(roomCode).emit(socketConfig.events.message.new, newMessage);
      client
        .to(roomCode)
        .emit(socketConfig.events.room.participant.update, room.participants);
      client.leave(roomCode);
    } catch (error) {}
  }

  @SubscribeMessage(socketConfig.events.message.new)
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomCode, message }: SendMessagePayload,
  ) {
    const newMessage: Message = {
      ...message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        socketId: client.id,
        username: client.handshake.query.username as string,
        color: client.handshake.query.color as string,
        language: client.handshake.query.language as string,
      },
    };

    this.server.to(roomCode).emit(socketConfig.events.message.new, newMessage);
  }
}

const createSystemMessage = (content: string) => {
  return {
    content,
    sender: {
      username: 'system',
      color: '#000',
      socketId: 'system',
      language: 'en',
    },
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
