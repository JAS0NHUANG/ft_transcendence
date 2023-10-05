import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class messageDTO {
  room: string;
  text: string;
}

export class createRoomDTO {
  name: string;
  status: RoomStatus;
  password?: string;
}

export class joinRoomDTO {
  name: string;
  password?: string;
}

export class channelDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AdminDTO {
  @ApiProperty({ description: 'user to be muted/banned/kicked' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'channel name' })
  @IsString()
  @IsNotEmpty()
  channel: string;
}

export class ChatUser {
  constructor(
    public email: string,
    public socketID: string,
    public userName: string,
  ) {}
}

export class ChatMessage {
  constructor(
    public room: string,
    public sender: string,
    public text: string,
  ) {}
}

export class ChatRoom {
  constructor(
    public roomID: string,
    public status: string,
    public password: string,
    public members: ChatUser[],
    public owner: string,
    public admins: ChatUser[],
    public muted: ChatUser[],
  ) {}
}
