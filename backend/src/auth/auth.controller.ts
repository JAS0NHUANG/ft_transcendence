import {
  Body,
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FourtyTwoAuthGuard } from './guard/FourtyTwo.guard';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto } from './dto';
import { TwoFA } from './strategy';
import { JwtGuard } from './guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';

@ApiTags('User')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private twoFA: TwoFA) {}

  @Get('fourtytwo/login')
  @UseGuards(FourtyTwoAuthGuard)
  @ApiOkResponse({ description: 'Try logging in using 42 oauth' })
  @ApiUnauthorizedResponse({ description: 'Login failed.' })
  handle42Oauth(): void {
    return;
  }

  @Get('fourtytwo/callback')
  @UseGuards(FourtyTwoAuthGuard)
  @ApiOkResponse({ description: '42 oauth callback url' })
  @ApiUnauthorizedResponse({ description: 'Login failed.' })
  async handle42Login(
    @Res() res: any,
    @Req() req: any,
    accessToken: string,
  ): Promise<void> {
    await this.authService.fourtyTwoLogin(res, req.user, accessToken);
  }

  @Post('local/signup')
  @ApiOperation({ description: 'create a local account' })
  @ApiOkResponse({ description: 'User has been created.' })
  @ApiUnauthorizedResponse({
    description: 'User could not be created. Please try again!',
  })
  signup(@Res() res: any, @Body() dto: AuthDto) {
    return this.authService.localSignup(res, dto);
  }

  @Post('local/login')
  @ApiOkResponse({ description: 'User is now online.' })
  @ApiUnauthorizedResponse({ description: 'Login failed. Please try again!' })
  signin(@Body() dto: LoginDto, @Res() res: any) {
    return this.authService.localLogin(dto, res);
  }

  @UseGuards(JwtGuard)
  @Post('2fa-verify')
  @ApiOkResponse({ description: 'User is now online.' })
  @ApiUnauthorizedResponse({ description: '2FA failed. Please try again!' })
  async twoFAVerify(
    @Body() payload: { code: string },
    @Res() res: any,
    @GetUser() user: User,
  ) {
	await this.authService.twoFAVerify(user, res, payload);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  @ApiOkResponse({ description: 'User is now offline.' })
  @ApiUnauthorizedResponse({ description: 'Logout failed.' })
  async logout(
    @Req() req: any,
    @Res() res: any,
    @GetUser() user: User): Promise<void> {
    await this.authService.handleLogout(user, res, req);
  }
}
