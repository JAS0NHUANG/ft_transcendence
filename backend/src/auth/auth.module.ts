import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, TwoFA, FourtyTwoStrategy } from './strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule, PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    FourtyTwoStrategy,
    PrismaService,
    JwtStrategy,
    TwoFA,
    ConfigService,
  ],
})
export class AuthModule {}