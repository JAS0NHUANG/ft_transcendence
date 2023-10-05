import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaService } from 'nestjs-prisma';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [ChannelService, PrismaService, JwtService],
  exports: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
