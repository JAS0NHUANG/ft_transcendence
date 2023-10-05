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
import { AuthDto, EnableTwoFADTO, LoginDto, VerifyTwoFADTO } from '../dto';
import { TwoFA } from './strategy';
import { JwtGuard } from './guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';

@ApiTags('Authentification')
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
  async signup(@Res() res: any, @Body() dto: AuthDto) {
    return await this.authService.localSignup(res, dto);
  }

  @Post('local/login')
  @ApiOkResponse({ description: 'User is now online.' })
  @ApiUnauthorizedResponse({ description: 'Login failed. Please try again!' })
  async signin(@Body() dto: LoginDto, @Res() res: any) {
    return await this.authService.localLogin(dto, res);
  }

  @Post('2fa-verify')
  @ApiOkResponse({ description: 'User is now online.' })
  @ApiUnauthorizedResponse({ description: '2FA failed. Please try again!' })
  async twoFAVerify(@Body() dto: VerifyTwoFADTO, @Res() res: any) {
    return await this.authService.twoFAVerify(res, dto);
  }

  @UseGuards(JwtGuard)
  @Post('2fa-enable')
  @ApiOkResponse({ description: '2FA is now enabled.' })
  @ApiUnauthorizedResponse({
    description: '2FA verification failed. Please try again!',
  })
  async twoFAEnable(
    @GetUser() user: User,
    @Body() dto: EnableTwoFADTO,
    @Res() res: any,
  ) {
    return await this.authService.twoFAEnable(user, res, dto);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  @ApiOkResponse({ description: 'User is now offline.' })
  @ApiUnauthorizedResponse({ description: 'Logout failed.' })
  async logout(
    @Req() req: Request,
    @Res() res: any,
    @GetUser() user: User,
  ): Promise<void> {
    await this.authService.handleLogout(user, res, req);
  }
}