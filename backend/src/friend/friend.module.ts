import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  providers: [FriendService],
  controllers: [FriendController, PrismaService]
})
export class FriendModule {}
