import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  hostSocketId: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  languages: string[];
}
