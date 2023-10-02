import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { GetUserByEmailDTO, GetUserByUsernameDTO, UpdateDto } from 'src/dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller('user')
// Guard is at control level, because all user-related actions
// need validation.
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // get "me" (own user profile)
  @Get('me')
  // GetUser custom decorator, because Request is error prone
  // and like this we can return a prisma type user.
  handleGetMe(@GetUser() user: User) {
    return user;
  }


  // update user data
  @Patch('update')
  @ApiOkResponse({
    description:
      'Returns "OK" when user info has been updated. Returns base64 string of Google Authenticator QR-image when 2FA has been enabled.',
  })
  @ApiBadRequestResponse({ description: 'Update failed. Please try again!' })
  @UseInterceptors(FilesInterceptor('avatar'))
  async handleUpdateUser(
    @GetUser() user: User,
    @Body() updateDto: UpdateDto,
    @UploadedFiles() files: any[],
  ) {
    if (files && files.length > 0) {
      const avatarFile = files[0].buffer.toString('base64');
      updateDto.avatar = avatarFile;
    }
    return await this.userService.updateUser(user, updateDto);
  }

  @Get('all-users')
  @ApiOkResponse({
    description: 'Returns public data of all users',
  })
  async handlegetAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('allUsernames')
  @ApiOkResponse({
    description: 'Returns username of all users',
  })
  async handleGetAllUsernames() {
    return await this.userService.getAllUsernames();
  }

  // get all active users in order of win rate
  @Get('leaderboard')
  @ApiOkResponse({
    description: 'Returns ranked list of all users',
  })
  async getLeaderboard() {
    return await this.userService.getLeaderboard();
  }

  @Get('userByUsername')
  @ApiOkResponse({
    description: 'Returns public data of one user',
  })
  async handleGetUserByUsername(@Body() dto: GetUserByUsernameDTO) {
    return await this.userService.getUserByUsername(dto);
  }

  @Get('usernameByEmail')
  @ApiOkResponse({
    description: 'Returns public data of one user',
  })
  async handleGetUserByEmail(@Body() dto: GetUserByEmailDTO) {
    return await this.userService.getUserByEmail(dto);
  }

  @Get('myGameHistory')
  @ApiOkResponse({
    description: 'Returns the game history of the logged in user.',
  })
  async handleGetMyGameHistory(@GetUser() user: User) {
    return await this.userService.getMyGameHistory(user);
  }
}
