import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Game, User, BlockedUser } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  UsernameDTO,
  UpdateDto,
  SecureUser,
} from 'src/dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as argon from 'argon2';
import { UserWithBlocklist, UserWithGames, UserWithBlockedUsers } from 'src/interfaces/prisma.interfaces';

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
        achievements: true,
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

  async getUserByUsername(dto: UsernameDTO): Promise<SecureUser> {
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
        achievements: true,
      },
    });
  }

  async getGameHistory(
    dto: UsernameDTO,
    requestingUser: User,
  ): Promise<UserWithGames> {
    const user: UserWithGames = await this.prisma.user.findUnique({
      where: {
        userName: dto.userName,
      },
      select: {
        userName: true,
        avatar: true,
        status: true,
        gamesWon: true,
        gamesLost: true,
        achievements: true,
        games: {
          select: {
            gameId: true,
            players: {
              select: {
                userName: true,
              },
            },
            winnerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Calculate userWon for each game based on the requesting user's username
    user.games = user.games.map((game) => {
      console.log(requestingUser.id);
      console.log(game.winnerId);
      const isWinner = game.winnerId === requestingUser.id;
      console.log('is winner', isWinner);
      return { ...game, userWon: isWinner };
    });

    return user;
  }

  async getRooms(user: User) {
    const userRooms = await this.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .rooms({
        select: {
          room: {
            select: {
              name: true,
              status: true,
            },
          },
          role: true,
        },
      });

    const roomData = userRooms.map((userRoom) => ({
      name: userRoom.room.name,
      status: userRoom.room.status,
      role: userRoom.role,
    }));

    return roomData;
  }

	async block(user: User, dto: UsernameDTO){
		const subject: User = await this.getSubject(user, dto.userName);
		const userWithBlock = await this.getUserWithBlocklist(user);
		const blockedUser = this.checkBlock(userWithBlock, subject);

		if (blockedUser) throw new BadRequestException('You have already blocked this person')

		// add subject to block list user  
		await this.prisma.blockedUser.create({
			data: {
				blocked: subject.id,
				blockedBy: user.id,
			},
		});

		const blockeduser = this.checkBlock(userWithBlock, subject);
	}

	async unblock(user: User, dto: UsernameDTO){
		const subject: User = await this.getSubject(user, dto.userName);
		const userWithBlock = await this.getUserWithBlocklist(user);
		const blockedUser = this.checkBlock(userWithBlock, subject);

		if (!blockedUser) throw new BadRequestException('You have not blocked this person')

		// remove subject from block list user
		await this.prisma.blockedUser.delete({
			where: {
				id: blockedUser.id,
			},
		});
		
		const blockeduser = this.checkBlock(userWithBlock, subject);
		console.log(blockeduser)
	}

	async getSubject(user: User, userName: string): Promise<User>{
		// return subject if it exists
		const subject: User = await this.prisma.user.findUnique({
			where: {
				userName: userName,
			}
		})

		if (!subject) throw new NotFoundException('User not found');

		if (subject.id === user.id) throw new ForbiddenException('Can not unblock yourself');
		
		return subject;
	}

	async getUserWithBlocklist(user: User): Promise<UserWithBlocklist>{
		// return user with block list
		const userWithBlock: UserWithBlocklist = await this.prisma.user.findUnique({
			where: {
				id: user.id,
			}, include: {
				blockList: true,
				blockedList: true,
			},
		});

		if (!userWithBlock) throw new NotFoundException('Please register again');
		
		return userWithBlock;
	}

	checkBlock(user: UserWithBlocklist, subject: User){
		// check if subject has been blocked
		const blockedSubject: BlockedUser = user.blockedList.find(
			(blockedUser: BlockedUser) => blockedUser.blocked === subject.id,
		);
		
		return blockedSubject;
	}

	async getBlocklist(user: User){
		const userWithBlock: UserWithBlocklist = await this.getUserWithBlocklist(user);
		console.log('blocklist', userWithBlock.blockList);
		console.log('blockedlist', userWithBlock.blockedList);

	}
}
