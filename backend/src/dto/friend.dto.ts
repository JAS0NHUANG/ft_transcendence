import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class FriendDto {

  @ApiProperty({ description: 'The user who sent the request' })
  @IsString()
  senderUserName: string;

  @ApiProperty({ description: 'The user who receive the request' })
  @IsString()
  receiverUserName: string;

}
