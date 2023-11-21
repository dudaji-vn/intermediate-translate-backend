import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { Participant } from 'src/types/participant';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  host: Participant;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  languages: string[];
}
