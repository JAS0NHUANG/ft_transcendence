import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { TwoFA } from './auth/strategy';
import { SocketModule } from './socket/socket.module';
import { GameModule } from './game/game.module';
import { GameService } from './game/game.service';
import { FriendModule } from './friend/friend.module';
import { ChannelModule } from './channel/channel.module';

const cacheConfig = {
  isGlobal: true,
  ttl: 1000 * 60 * 20, // ms, sec, min
  useFactory: async () => ({
    store: await redisStore({
      url: 'redis://redis:6789',
    }),
  }),
};

@Module({
  imports: [
    PrismaModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register(cacheConfig),
    UserModule,
    AuthModule,
    JwtModule,
    SocketModule,
    GameModule,
    FriendModule,
    ChannelModule,
  ],
  providers: [AuthService, UserService, GameService, TwoFA],
  controllers: [UserController],
})
export class AppModule {}
