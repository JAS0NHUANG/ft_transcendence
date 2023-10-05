import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  AdminDTO,
  channelDTO,
  adminDTO,
  changePassDTO,
  toPublicDTO,
} from 'src/dto';
import { User, Room, UserInRoom, RoomStatus, Message } from '@prisma/client';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import {
  RoomHistory,
  RoomWithMessages,
  RoomWithUsers,
  UserWithRooms,
} from 'src/interfaces';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /****************************************************************************/
  /* channel info											                                        */
  /****************************************************************************/

  async getRoomUserByUsername(username: string): Promise<UserInRoom> {
    const user = await this.prisma.user.findUnique({
      where: {
        userName: username,
      },
      include: {
        rooms: true,
      },
    });

    const userInRoom: UserInRoom = user.rooms.find(
      (userInRoom: UserInRoom) => userInRoom.email === user.email,
    );

    if (!userInRoom) throw new NotFoundException('User is not in this room');

    return userInRoom;
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

  async getChannelMembers(dto: channelDTO) {
    const room = await this.prisma.room.findUnique({
      where: {
        name: dto.name,
      },
    });
    if (!room) throw new NotFoundException('Room not found');

    const usersInRoom = await this.prisma.userInRoom.findMany({
      where: {
        room: {
          name: dto.name,
        },
        isBanned: false,
      },
      select: {
        user: {
          select: {
            userName: true,
          },
        },
      },
    });

    const usernames = usersInRoom.map((userInRoom) => userInRoom.user.userName);

    return usernames;
  }

  /****************************************************************************/
  /* get history									 			                                      */
  /****************************************************************************/

  async getChannelHistory(user: User, dto: channelDTO): Promise<RoomHistory> {
    const room: RoomWithUsers = await this.checkRoom(dto);
    const userInRoom: UserInRoom = await this.allowedToReceive(user, room);

    if (userInRoom) {
      const messages: Message[] = await this.prisma.message.findMany({
        where: {
          roomID: room.name,
        },
      });
      return { room: room.name, messages };
    }
    return null;
  }

  async getFullHistory(user: User): Promise<RoomHistory[]> {
    const userRooms: UserWithRooms | null = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
      include: {
        rooms: true,
      },
    });

    if (!userRooms) {
      throw new NotFoundException('User not found');
    }

    let history: RoomHistory[] = [];

    for (const room of userRooms.rooms) {
      const messages = await this.prisma.message.findMany({
        where: {
          roomID: room.roomID,
        },
      });

      history.push({
        room: room.roomID,
        messages: messages,
      });
    }

    return history;
  }

  async checkRoom(dto: channelDTO): Promise<RoomWithUsers> {
    // check if room exists
    const room: RoomWithUsers = await this.prisma.room.findUnique({
      where: {
        name: dto.name,
      },
      include: {
        users: true,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    return room;
  }

  async allowedToReceive(user: User, room: RoomWithUsers): Promise<UserInRoom> {
    // check if user is in room
    const userInRoom = await room.users.find((roomUser: UserInRoom) => {
      return roomUser.email === user.email;
    });

    if (!userInRoom) throw new NotFoundException('You are not in this room');

    // check if user is banned
    if (room.status !== RoomStatus.DIRECT) {
      if (userInRoom.isBanned)
        throw new ForbiddenException(
          'Too bad, you have been banned from this channel...',
        );
    }

    return userInRoom;
  }

  /****************************************************************************/
  /* owner options										                                        */
  /****************************************************************************/

  async toPublic(user: User, dto: toPublicDTO) {
    const room: Room = await this.ownerCheck(user, dto);

    if (room) {
      await this.prisma.room.update({
        where: {
          name: dto.channel,
        },
        data: {
          status: 'PUBLIC',
          password: '',
        },
      });
    }
  }

  async toPrivate(user: User, dto: changePassDTO) {
    const room: Room = await this.ownerCheck(user, dto);

    const hash: string = await argon.hash(dto.password);
    if (room) {
      await this.prisma.room.update({
        where: {
          name: dto.channel,
        },
        data: {
          status: 'PRIVATE',
          password: hash,
        },
      });
    }
  }

  async changePass(user: User, dto: changePassDTO) {
    const room: Room = await this.ownerCheck(user, dto);
    const oldpass: string = room.password;

    const hash: string = await argon.hash(dto.password);
    if (room) {
      await this.prisma.room.update({
        where: {
          name: dto.channel,
        },
        data: {
          password: hash,
        },
      });
    }
  }

  async addAdmin(user: User, dto: adminDTO) {
    const room = await this.ownerCheck(user, dto);

    if (room) {
      // get the user that needs to change status
      const userInRoom = await this.getRoomUserByUsername(dto.userName);

      // few checks
      if (!userInRoom) throw new NotFoundException('User is not in this room');
      else if (userInRoom.role === 'OWNER')
        throw new BadRequestException('Can not downgrade room owner');
      else if (userInRoom.role === 'ADMIN')
        throw new BadRequestException('User is already admin');
      // change status
      else {
        await this.prisma.userInRoom.update({
          where: {
            id: userInRoom.id,
          },
          data: {
            role: 'ADMIN',
          },
        });
      }
    }
  }

  async removeAdmin(user: User, dto: adminDTO) {
    const room = await this.ownerCheck(user, dto);

    if (room) {
      // get the user that needs to change status
      const userInRoom = await this.getRoomUserByUsername(dto.userName);

      // few checks
      if (userInRoom.role === 'OWNER')
        throw new BadRequestException('Can not downgrade room owner');
      else if (userInRoom.role === 'USER')
        throw new BadRequestException('User is not admin');
      // change status
      else {
        await this.prisma.userInRoom.update({
          where: {
            id: userInRoom.id,
          },
          data: {
            role: 'USER',
          },
        });
      }
    }
  }

  async ownerCheck(user: User, dto: toPublicDTO) {
    const room = await this.prisma.room.findUnique({
      where: {
        name: dto.channel,
      },
      include: {
        users: true,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    const userInRoom: UserInRoom = room.users.find(
      (userInRoom: UserInRoom) => userInRoom.email === user.email,
    );

    if (!userInRoom) throw new NotFoundException('You are not in this room');

    if (userInRoom.role !== 'OWNER')
      throw new UnauthorizedException('You are not the channel owner');

    return room;
  }

  /****************************************************************************/
  /* admin options										                                        */
  /****************************************************************************/

  async mute(user: User, dto: AdminDTO) {
    const admin: UserInRoom = await this.adminCheck(user, dto);

    if (admin) {
      const userInRoom: UserInRoom = await this.getRoomUserByUsername(
        dto.username,
      );
      const ok: boolean = this.relationCheck(admin, userInRoom, 'mute');

      if (ok) {
        await this.prisma.userInRoom.update({
          where: {
            id: userInRoom.id,
          },
          data: {
            isMuted: true,
          },
        });

        const thirtyMinutes: number = 1800000;
        setTimeout(async () => {
          const unmuted = await this.prisma.userInRoom.update({
            where: {
              id: userInRoom.id,
            },
            data: {
              isMuted: false,
            },
          });
        }, thirtyMinutes);
      }
    }
  }

  async ban(user: User, dto: AdminDTO) {
    const admin: UserInRoom = await this.adminCheck(user, dto);

    if (admin) {
      const userInRoom: UserInRoom = await this.getRoomUserByUsername(
        dto.username,
      );
      const ok: boolean = this.relationCheck(admin, userInRoom, 'ban');

      if (ok) {
        // set room user to banned to exclude them from channel events
        await this.prisma.userInRoom.update({
          where: {
            id: userInRoom.id,
          },
          data: {
            isBanned: true,
          },
        });
      }
    }
  }

  async unban(user: User, dto: AdminDTO) {
    const admin: UserInRoom = await this.adminCheck(user, dto);

    if (admin) {
      const userInRoom: UserInRoom = await this.getRoomUserByUsername(
        dto.username,
      );
      const ok: boolean = this.relationCheck(admin, userInRoom, 'unban');

      if (ok) {
        // unban room user
        await this.prisma.userInRoom.update({
          where: {
            id: userInRoom.id,
          },
          data: {
            isBanned: false,
          },
        });
      }
    }
  }

  async kick(user: User, dto: AdminDTO) {
    const admin: UserInRoom = await this.adminCheck(user, dto);

    if (admin) {
      const userInRoom: UserInRoom = await this.getRoomUserByUsername(
        dto.username,
      );
      const ok: boolean = this.relationCheck(admin, userInRoom, 'kick');

      if (ok) {
        // remove room user
        await this.prisma.userInRoom.delete({
          where: {
            id: userInRoom.id,
          },
        });
      }
    }
  }

  async adminCheck(user: User, dto: AdminDTO): Promise<UserInRoom> {
    const room = await this.prisma.room.findUnique({
      where: {
        name: dto.channel,
      },
      include: {
        users: true,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    const userInRoom: UserInRoom = room.users.find(
      (userInRoom: UserInRoom) => userInRoom.email === user.email,
    );

    if (!userInRoom) throw new NotFoundException('You are not this room');

    if (!(userInRoom.role === 'OWNER' || userInRoom.role === 'ADMIN'))
      throw new UnauthorizedException(
        'You need to be admin or owner for this operation',
      );

    return userInRoom;
  }

  relationCheck(admin: UserInRoom, otherUser: UserInRoom, action: string) {
    if (admin.role === 'ADMIN' && otherUser.role === 'ADMIN') {
      throw new ForbiddenException('Can not ' + action + ' other admin');
    } else if (admin.role === 'ADMIN' && otherUser.role === 'OWNER') {
      throw new ForbiddenException('Can not ' + action + ' owner');
    }
    return true;
  }
}
