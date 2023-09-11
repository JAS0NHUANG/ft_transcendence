import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';

import { GetUser } from 'src/decorator';
import { JwtGuard } from 'src/auth/guard';


import { FriendService } from './friend.service';

@ApiTags('Friend')
@Controller('friend')
@UseGuards(JwtGuard)
export class FriendController {
  constructor(
    private friendService: FriendService,
    private prisma: PrismaService,
  ) {}

  // Get user's friend list
  @Get('friendList')
  async getFriendList(@GetUser() user: User){
    console.log(user);
    return user.friends;
  }

  // Send request
  @Patch('sendFriendRequest')
  async sendFriendRequest(receiverUserName: string, res: any) {
    const receiver = await this.prisma.user.findUnique({
      where: {
        userName: receiverUserName,
      },
    });
    if (!receiver) throw new BadRequestException('No such user.');
  }

  // Cancel sent request
  @Patch('cancelFriendRequest')
  async canelFriendRequest(receiverUserName: string, res: any) {
    // remove receiverUserName from friendRequestSent array


    // remove the sender's userName from receiver's friendRequestReceived array
    if (!receiverUserName) throw new BadRequestException('No such user.');

    try {
      const receiver = await this.prisma.user.findUnique({
        where: {
          userName: receiverUserName,
        },
      });
      if (!receiver) throw new BadRequestException('No such user.');
    } catch (err) {
      throw err;
    }
  }

  // Accept received request
  @Patch('acceptFriendRequest')
  async acceptFriendRequest(senderUserName: string, res: any) {
    // remove senderUserName from friendRequestReceived array
    // add senderUserName to friends array
  }

  // unfriend
  @Patch('unFriend')
  async unFriend(friendUserName: string, res: any) {
  }
}
