import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminDTO } from '../dto';
import { toPublicDTO, changePassDTO, adminDTO } from '../dto';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { channelDTO } from 'src/dto';
import { Response } from 'express';
import { ChannelService } from './channel.service';
import { UserWithRooms } from 'src/interfaces';

@UseGuards(JwtGuard)
@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Patch('mute')
  @ApiOkResponse({ description: 'User has been muted for the coming hour' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleMute(
    @GetUser() user: User,
    @Body() dto: AdminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.mute(user, dto);
    return res.status(200).send({ message: 'User muted for 30 minutes' });
  }

  @Patch('ban')
  @ApiOkResponse({ description: 'User banned from channel' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleBan(
    @GetUser() user: User,
    @Body() dto: AdminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.ban(user, dto);
    return res.status(200).send({ message: 'User banned from channel' });
  }

  @Patch('unban')
  @ApiOkResponse({ description: 'Usr ban llifted' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleUnban(
    @GetUser() user: User,
    @Body() dto: AdminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.unban(user, dto);
    return res.status(200).send({ message: 'User ban lifted' });
  }

  @Patch('kick')
  @ApiOkResponse({ description: 'User kicked from channel' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleKick(
    @GetUser() user: User,
    @Body() dto: AdminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.kick(user, dto);
    return res.status(200).send({ message: 'User kicked from channel' });
  }

  @Patch('toPublic')
  @ApiOkResponse({ description: 'Channel has been set to public' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleToPublic(
    @GetUser() user: User,
    @Body() dto: toPublicDTO,
    @Res() res: Response,
  ) {
    await this.channelService.toPublic(user, dto);
    return res.status(200).send({ message: 'Channel set to public' });
  }

  @Patch('toPrivate')
  @ApiOkResponse({ description: 'Channel has been set to private' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleToPrivate(
    @GetUser() user: User,
    @Body() dto: changePassDTO,
    @Res() res: Response,
  ) {
    await this.channelService.toPrivate(user, dto);
    return res.status(200).send({ message: 'Channel set to private' });
  }

  @Patch('changePass')
  @ApiOkResponse({ description: 'Password has been updated' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleChangePass(
    @GetUser() user: User,
    @Body() dto: changePassDTO,
    @Res() res: Response,
  ) {
    await this.channelService.changePass(user, dto);
    return res.status(200).send({ message: 'Channel password changed' });
  }

  @Patch('addAdmin')
  @ApiOkResponse({ description: 'User is now channel admin' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleAddAdmin(
    @GetUser() user: User,
    @Body() dto: adminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.addAdmin(user, dto);
    return res
      .status(200)
      .send({ message: dto.userName + ' is now channel admin' });
  }

  @Patch('removeAdmin')
  @ApiOkResponse({ description: 'User is no longer channel admin' })
  @ApiUnauthorizedResponse({ description: 'Channel modification not possible' })
  async handleRemoveAdmin(
    @GetUser() user: User,
    @Body() dto: adminDTO,
    @Res() res: Response,
  ) {
    await this.channelService.removeAdmin(user, dto);
    return res
      .status(200)
      .send({ message: dto.userName + ' is removed from channel admins' });
  }

  @Get('rooms')
  @ApiOkResponse({ description: 'Returns rooms that user is connected to' })
  @ApiUnauthorizedResponse({ description: 'Authentification failed' })
  async handleGetRooms(@GetUser() user: User) {
    return this.channelService.getRooms(user);
  }

  @Get('members')
  @ApiOkResponse({
    description: 'Returns usernames of users connected to a room',
  })
  @ApiUnauthorizedResponse({ description: 'Authentification failed' })
  async handleGetChannelMembers(@Query() dto: channelDTO) {
    return await this.channelService.getChannelMembers(dto);
  }

  @Get('history')
  @ApiOkResponse({
    description: 'Returns message history channel',
  })
  @ApiOkResponse({ description: 'Authentification failed' })
  async handleGetChannelHistory(
    @GetUser() user: User,
    @Query() dto: channelDTO,
  ) {
    return await this.channelService.getChannelHistory(user, dto);
  }

  @Get('fullHistory')
  @ApiOkResponse({
    description: 'Returns message history channel',
  })
  @ApiOkResponse({ description: 'Authentification failed' })
  async handleGetFullHistory(@GetUser() user: User) {
    return await this.channelService.getFullHistory(user);
  }
}
