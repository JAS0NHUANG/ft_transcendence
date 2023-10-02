import { Injectable, ForbiddenException } from '@nestjs/common';
import { User, Game } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  GetUserByUsernameDTO,
  UpdateDto,
  GetUserByEmailDTO,
  SecureUser,
} from 'src/dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUser(user: User, dto: UpdateDto): Promise<string> {
    const { password, oldPassword, twoFAActivated, ...otherFields } = dto;

    if (password) {
      if (user.isFourtyTwoStudent)
        throw new ForbiddenException("Can't change 42 password");

      if (oldPassword === undefined)
        throw new ForbiddenException('Old password is required');

      const passwordMatches = await argon.verify(user.password, oldPassword);
      if (!passwordMatches)
        throw new ForbiddenException('Old password is incorrect');

      const hash = await argon.hash(dto.password);
      this.updatePassword(user, hash);
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: otherFields,
    });

    if (dto.twoFAActivated) {
      const otpauthUrl = await this.generate2FASecret(user);
      if (!user.achievements.includes('TWOFA')) {
        user.achievements.push('TWOFA');
        // emit notification achievement?
      }
      return await toDataURL(otpauthUrl);
    } else if (dto.twoFAActivated === false) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFASecret: null,
          twoFAActivated: false,
        },
      });
    }
    return 'OK';
  }

  async updatePassword(user: User, hashNewPassword: string) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashNewPassword,
      },
    });
  }

  private async generate2FASecret(user: User): Promise<string> {
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFASecret: secret,
      },
    });
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'PongStoryShort',
      secret,
    );
    return otpauthUrl;
  }

  async getAllUsers(): Promise<SecureUser[]> {
    const allUserData: SecureUser[] = await this.prisma.user.findMany({
      select: {
        userName: true,
        avatar: true,
        status: true,
        gamesWon: true,
        gamesLost: true,
      },
    });
    return allUserData;
  }

  async getAllUsernames(): Promise<string[]> {
    const objectUsernames = await this.prisma.user.findMany({
      select: {
        userName: true,
      },
    });
    const usernames: string[] = objectUsernames.map((user) => user.userName);
    return usernames;
  }

  async getLeaderboard() {
    const allUsers: SecureUser[] = await this.getAllUsers();

    const sortedUsers = allUsers.sort((a, b) => {
      const winRateA =
        a.gamesWon + a.gamesLost === 0
          ? 0
          : a.gamesWon / (a.gamesWon + a.gamesLost);
      const winRateB =
        b.gamesWon + b.gamesLost === 0
          ? 0
          : b.gamesWon / (b.gamesWon + b.gamesLost);

      if (winRateA > winRateB) return -1;
      if (winRateA < winRateB) return 1;
      return 0;
    });

    let currentWinRate = null;
    let currentPlace = 0;
    const leaderboard = sortedUsers.map((user, index) => {
      const winRate =
        user.gamesWon + user.gamesLost === 0
          ? 0
          : user.gamesWon / (user.gamesWon + user.gamesLost);

      if (winRate !== currentWinRate) {
        currentWinRate = winRate;
        currentPlace = index + 1;
      }

      return {
        place: currentPlace,
        userName: user.userName,
        avatar: user.avatar,
        gamesWon: user.gamesWon,
        gamesPlayed: user.gamesWon + user.gamesLost,
      };
    });
    return leaderboard;
  }

  async getUserByUsername(dto: GetUserByUsernameDTO): Promise<SecureUser> {
    return await this.prisma.user.findUnique({
      where: {
        userName: dto.userName,
      },
      select: {
        userName: true,
        avatar: true,
        status: true,
        gamesWon: true,
        gamesLost: true,
      },
    });
  }

  async getUserByEmail(dto: GetUserByEmailDTO): Promise<SecureUser> {
    return await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        userName: true,
        avatar: true,
        status: true,
        gamesWon: true,
        gamesLost: true,
      },
    });
  }

  async getMyGameHistory(user: User): Promise<Game[]> {
    const username = user.userName;
    const userWithGameHistory = await this.prisma.user.findUnique({
      where: {
        userName: username,
      },
      include: {
        games: true,
      },
    });
    return userWithGameHistory.games;
  }
}
