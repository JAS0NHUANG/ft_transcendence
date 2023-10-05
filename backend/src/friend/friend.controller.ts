import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  // GET
  /*****************************************************************************/
  // Get user's friend list
  @Get('friendList')
  @ApiOkResponse({
    description:
      'returns an object { friendList: [] } with the user data objects inside the array',
  })
  async getFriendList(@GetUser() user: User) {
    return { friendList: await this.friendService.getFriendList(user) };
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
  // POST
  /*****************************************************************************/
  // add friend directly(Don't care if he/she wants~~~)
  @Post('addFriend')
  @ApiOperation({
    description: 'addFriend by providing and object like { userName: abc }',
  })
  async handleAddFriend(
    @GetUser() user: User,
    @Body() payload: { userName: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.addFriend(user, payload, res);
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }

  // Send request
  @Post('sendFriendRequest')
  async handleSendFriendRequest(
    @GetUser() user: User,
    @Body() payload: { userEmail: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.sendFriendRequest(
      user,
      payload,
      res,
    );
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }

  /*****************************************************************************/
  // PATCH
  /*****************************************************************************/
  // Accept request
  @Patch('acceptFriendRequest')
  async handleAcceptFriendRequest(
    @GetUser() user: User,
    @Body() payload: { userEmail: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.acceptFriendRequest(
      user,
      payload,
      res,
    );
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }

  // unfriend directly(Don't care if he/she wants~~~)
  @Patch('unfriend')
  @ApiOperation({
    description: 'unfriend by providing and object like { userName: abc }',
  })
  async handleUnfriend(
    @GetUser() user: User,
    @Body() payload: { userName: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.unfriend(user, payload, res);
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }
  /*****************************************************************************/
  // DELETE
  /*****************************************************************************/
  // Cancel request
  @Delete('cancelFriendRequest')
  async handleCancelFriendRequest(
    @GetUser() user: User,
    @Body() payload: { userEmail: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.cancelFriendRequest(
      user,
      payload,
      res,
    );
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }

  // Decline request
  @Delete('declineFriendRequest')
  async handleDeclineFriendRequest(
    @GetUser() user: User,
    @Body() payload: { userEmail: string },
    @Res() res: Response,
  ) {
    const result = await this.friendService.declineFriendRequest(
      user,
      payload,
      res,
    );
    res
      .status(result.statusCode)
      .send({ status: result.status, message: result.message });
  }
}
