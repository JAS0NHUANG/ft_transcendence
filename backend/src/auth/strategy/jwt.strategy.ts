import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'nestjs-prisma';
import { Request } from 'express';

const ExtractJwtFromCookie = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwtFromCookie,
      secretOrKey: config.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user || user.status === 'OFFLINE') {
      console.log('user is offline');
      throw new UnauthorizedException('Unauthorized');
    }

    const token = ExtractJwtFromCookie(req);
    if (token) {
      const tokenBlacklisted = await this.isTokenBlacklisted(token);
      if (tokenBlacklisted) {
        console.log('user has invalid token');
        throw new UnauthorizedException('Invalid token');
      }
    } else {
      console.log('no token found');
      throw new UnauthorizedException('No token found');
    }

    return user;
  }

  async isTokenBlacklisted(token: string) {
    const blacklistedToken = await this.prisma.jwtBlacklist.findUnique({
      where: {
        token,
      },
    });

    return blacklistedToken;
  }
}
