import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { JwtGuard } from 'src/auth/guard';

import { FriendService } from './friend.service';
import { GetUser } from 'src/decorator';

@ApiTags('Friend')
@Controller('friend')
@UseGuards(JwtGuard)
export class FriendController {
  constructor(private friendService: FriendService) {}

  /*****************************************************************************/
  /* Get */
  /*****************************************************************************/
  // Get user's friend list
  @Get('friendList')
  async getFriendList(@GetUser() user: User) {
    return { friendList: user.friends };
  }

  // Get the requests received from other users
  @Get('receivedRequests')
  async getReceivedRequests(@GetUser() user: User) {
    return { receivedRequests: user.friendRequestsReceived };
  }

  // Get the requests sent by me
  @Get('sentRequests')
  async getSentRequests(@GetUser() user: User) {
    return { sentRequests: user.friendRequestsSent };
  }

  /*****************************************************************************/
  // Patch
  /*****************************************************************************/
  // Send request
  @Patch('sendFriendRequest')
  async sendFriendRequest(
    @GetUser() sender: User,
    @Body() receiver: { userName: string },
    @Res() res: any,
  ) {
    const result = await this.friendService.sendFriendRequest(
      sender,
      receiver,
      res,
    );
    res.status(result.statusCode).send({ status: result.status });
  }

  // Cancel sent request
  @Patch('cancelFriendRequest')
  async cancelFriendRequest(
    @GetUser() sender: User,
    @Body() receiver: { userName: string },
    @Res() res: any,
  ) {
    const result = await this.friendService.cancelFriendRequest(
      sender,
      receiver,
      res,
    );
    res.status(result.statusCode).send({ status: result.status });
  }

  // Accept received request
  @Patch('acceptFriendRequest')
  async acceptFriendRequest(
    @GetUser() receiver: User,
    @Body() sender: { userName: string },
    @Res() res: any,
  ) {
    // remove senderUserName from friendRequestReceived array
    // add senderUserName to friends array
    const result = await this.friendService.acceptFriendRequest(
      receiver,
      sender,
      res,
    );
    res.status(result.statusCode).send({ status: result.status });
  }

  // Decline received request
  @Patch('declineFriendRequest')
  async declineFriendRequest(
    @GetUser() receiver: User,
    @Body() sender: { userName: string },
    @Res() res: any,
  ) {
    // remove senderUserName from friendRequestReceived array
    // add senderUserName to friends array
    const result = await this.friendService.declineFriendRequest(
      receiver,
      sender,
      res,
    );
    res.status(result.statusCode).send({ status: result.status });
  }

  // unfriend
  @Patch('unfriend')
  async unfriend(
    @GetUser() sender: User,
    @Body() friendUserName: { userName: string },
    @Res() res: any,
  ) {
    const result = await this.friendService.unfriend(
      sender,
      friendUserName,
      res,
    );
    res.status(result.statusCode).send({ status: result.status });
  }
}
