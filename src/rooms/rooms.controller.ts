import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators';
import { Response } from 'src/common/types';
import { CreateRoomDto } from './dtos';
import { RoomsService } from './rooms.service';
import { Room } from './schemas/room.schema';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  @Public()
  @Post()
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<Response<Room>> {
    const room = await this.roomsService.createRoom(createRoomDto);
    return { data: room, message: 'Room created' };
  }
}
