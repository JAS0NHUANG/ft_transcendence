import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class toPublicDTO {
  @ApiProperty({ description: 'Channel name' })
  @IsString()
  channel: string;
}

export class changePassDTO {
  @ApiProperty({ description: 'Channel name' })
  @IsString()
  channel: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  password: string;
}

export class adminDTO {
  @ApiProperty({ description: 'Channel name' })
  @IsString()
  channel: string;

  @ApiProperty({ description: 'User to add/remove from admins' })
  @IsString()
  userName: string;
}
