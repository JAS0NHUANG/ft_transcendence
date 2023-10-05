import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  ChatUser,
  messageDTO,
  createRoomDTO,
  joinRoomDTO,
  ChatMessage,
  AdminDTO,
  channelDTO,
  adminDTO,
  changePassDTO,
  toPublicDTO,
} from 'src/dto';
import { User, RoomStatus, Room, UserInRoom, Status } from '@prisma/client';
import * as argon from 'argon2';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer } from '@nestjs/websockets';
import { RoomWithUsers, UserWithRooms } from 'src/interfaces';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  /****************************************************************************/
  /* handle connection/disconnection                                          */
  /****************************************************************************/

  async newConnection(client: Socket): Promise<ChatUser | null> {
    // decode authorization header to get email
    const email: string = this.getEmailFromJWT(client);
    if (!email) return;

    // update cache and join socket to rooms
    const chatUser = await this.reconnectUser(email, client);

    // send error message if not found
    if (!chatUser) {
      client.emit('accessDenied', {
        message: 'Account not found, please reconnect.',
      });
      client.disconnect();
      return;
    }

    return chatUser;
  }

  getEmailFromJWT(client: Socket) {
    const jwt = client.handshake.headers.authorization;

    if (jwt === undefined || jwt === null) {
      client.emit('accessDenied', {
        message: 'Authentification failed, please log in again.',
      });
      client.disconnect();
      return;
    } else {
      const jwtData:
        | { sub: string; email: string; iat: string; exp: string }
        | any = this.jwtService.decode(jwt);
      return jwtData.email;
    }
  }

  async fetchChatuser(email: string): Promise<ChatUser | null> {
    const cacheUser: string = await this.cacheManager.get('chat' + email);
    if (cacheUser) {
      const existingUser: ChatUser = JSON.parse(cacheUser);
      return existingUser;
    }

    return null;
  }

  async fetchPrismaUser(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async fetchPrismaUserWithRooms(email: string): Promise<UserWithRooms | null> {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        rooms: true,
      },
    });
  }

  async reconnectUser(email: string, socket: Socket) {
    // find user in prisma including connected rooms
    const prismaUser: UserWithRooms = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        rooms: true,
      },
    });

    if (!prismaUser) {
      return null;
    }

    // find user in cache
    let chatUser: ChatUser = await this.fetchChatuser(email);

    // update socketID or create new cache user
    if (chatUser) {
      chatUser.socketID = socket.id;
      console.log('update existing chat user:', email);
    } else {
      chatUser = new ChatUser(prismaUser.email, socket.id, prismaUser.userName);
      console.log('creating new chat user:', email);
    }

    // rejoin all rooms
    for (const room of prismaUser.rooms) {
      if (!room.isBanned) socket.join(room.roomID);
    }

    // set or update cache
    await this.cacheManager.set(`chat${email}`, JSON.stringify(chatUser));

    return chatUser;
  }

  /****************************************************************************/
  /* create channel									                                          */
  /****************************************************************************/

  async createChannel(client: Socket, roomDTO: createRoomDTO) {
    const email: string = this.getEmailFromJWT(client);
    const chatuser: ChatUser = await this.fetchChatuser(email);
    const prismaUser: UserWithRooms = await this.fetchPrismaUserWithRooms(
      chatuser.email,
    );

    try {
      await this.securityCheckCreateChannel(prismaUser, roomDTO);
    } catch (error) {
      throw error;
    }

    // join socket to room
    client.join(roomDTO.name);

    // create new room
    try {
      await this.prisma.room.create({
        data: {
          ...roomDTO,
          users: {
            create: [
              {
                user: {
                  connect: { email: chatuser.email },
                },
                role: 'OWNER',
              },
            ],
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Channel could not be created, did you send the right variables?',
      );
    }

    // send a little welcome message
    await this.sendServerMessage({
      room: roomDTO.name,
      text: 'Congratulations! You have successfully created a channel.',
    });

    return roomDTO.name;
  }

  async securityCheckCreateChannel(prismaUser: User, roomDTO: createRoomDTO) {
    // check naming conventions
    if (
      roomDTO.name &&
      roomDTO.name.includes('@') &&
      roomDTO.status !== RoomStatus.DIRECT
    )
      throw new BadRequestException('Room name has invalid character (@)');

    // check if user exists
    if (!prismaUser)
      throw new BadRequestException(
        'Your account has been deleted. Please register again.',
      );

    // catch prisma error when variables are not correct
    let existingRoom: Room;
    try {
      existingRoom = await this.prisma.room.findUnique({
        where: {
          name: roomDTO.name,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Channel could not be created, did you send the right variables?',
      );
    }

    // check if room exists
    if (existingRoom) throw new ConflictException('Room already exists');

    // check password for private room
    if (roomDTO.status === RoomStatus.PRIVATE) {
      if (!roomDTO.password)
        throw new ForbiddenException('Password mandatory for private channel');
      else {
        roomDTO.password = await argon.hash(roomDTO.password);
      }
    }
  }

  /****************************************************************************/
  /* create dm room									                                          */
  /****************************************************************************/

  async createDirectMessage(
    client: Socket,
    roomDTO: createRoomDTO,
  ): Promise<string> {
    const email: string = this.getEmailFromJWT(client);
    const chatuser: ChatUser = await this.fetchChatuser(email);
    const prismaUser = await this.fetchPrismaUser(chatuser.email);
    let otherPrismaUser: User;
    let roomName: string;

    try {
      otherPrismaUser = await this.prismaCheckOtherUser(
        roomDTO.name,
        prismaUser,
      );
      roomName = this.uniqueRoomName(prismaUser.email, otherPrismaUser.email);
      roomDTO.name = roomName;
      await this.securityCheckCreateChannel(prismaUser, roomDTO);
    } catch (error) {
      throw error;
    }

    // create a new room that is connected to both users
    try {
      await this.prisma.room.create({
        data: {
          ...roomDTO,
          name: roomName,
          users: {
            create: [
              {
                user: {
                  connect: { email: email },
                },
                role: 'USER',
              },
              {
                user: {
                  connect: { email: otherPrismaUser.email },
                },
                role: 'USER',
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Channel could not be created, did you send the right variables?',
      );
    }

    // join socket to room
    client.join(roomName);

    // notify other chatuser
    const otherChatUser = await this.fetchChatuser(otherPrismaUser.email);
    if (otherPrismaUser.status === Status.ONLINE && otherChatUser) {
      this.server.to(otherChatUser.socketID).emit('reconnectNeeded', {
        message: `DM ${roomName} created with user ${otherPrismaUser.userName}`,
      });
    }

    // send a little welcome message
    await this.sendServerMessage({
      room: roomDTO.name,
      text: `Welcome to this conversation, ${prismaUser.userName} and ${otherPrismaUser.userName}`,
    });

    return roomName;
  }

  uniqueRoomName(email1: string, email2: string) {
    const sortedIDs = [email1, email2].sort();
    const concatenatedIDs = sortedIDs.join('/');
    return concatenatedIDs;
  }

  async prismaCheckOtherUser(
    username: string,
    currentUser: User,
  ): Promise<User> {
    if (username === currentUser.userName)
      throw new BadRequestException('Can not open chat with yourself');

    const otherPrismaUser = await this.prisma.user.findUnique({
      where: {
        userName: username,
      },
    });
    if (!otherPrismaUser) {
      throw new BadRequestException('Other user not found');
    }

    return otherPrismaUser;
  }

  /****************************************************************************/
  /* join	channel									  	                                        */
  /****************************************************************************/

  async joinChannel(client: Socket, roomDTO: joinRoomDTO) {
    const email: string = this.getEmailFromJWT(client);
    const chatuser: ChatUser = await this.fetchChatuser(email);
    const prismaUser: UserWithRooms = await this.fetchPrismaUserWithRooms(
      chatuser.email,
    );

    try {
      await this.securityCheckJoinChannel(prismaUser, roomDTO);
    } catch (error) {
      throw error;
    }

    // joining socket to room
    client.join(roomDTO.name);

    // adding roomuser in prisma
    await this.prisma.room.update({
      where: {
        name: roomDTO.name,
      },
      data: {
        users: {
          create: [
            {
              user: {
                connect: { email: chatuser.email },
              },
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    // sending a little welcome message
    await this.sendServerMessage({
      room: roomDTO.name,
      text: `Please welcome ${prismaUser.userName} to this channel!`,
    });
  }

  async securityCheckJoinChannel(prismaUser: User, roomDTO: joinRoomDTO) {
    // check if user exists
    if (!prismaUser)
      throw new BadRequestException(
        'Your account has been deleted. Please register again.',
      );

    // catch prisma error when variables are not correct
    let room: RoomWithUsers;
    try {
      room = await this.prisma.room.findUnique({
        where: {
          name: roomDTO.name,
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Channel not found, did you send the right variables?',
      );
    }

    // check if room exists
    if (!room) throw new BadRequestException('This channel does not exist');

    // check if user hasn't been banned
    const userInRoom = await room.users.find((roomUser: UserInRoom) => {
      return roomUser.email === prismaUser.email;
    });
    if (userInRoom && userInRoom.isBanned)
      throw new ForbiddenException('Oh oh, you are banned from this channel');
    // check if user is already in channel
    else if (userInRoom)
      throw new ForbiddenException('You are already in this room');

    // check if room is joinable
    if (room.status === RoomStatus.DIRECT)
      throw new ForbiddenException(
        'Not possible to join a private conversation',
      );

    // check if password is correct for private room
    if (room.status === RoomStatus.PRIVATE) {
      if (!roomDTO.password)
        throw new ForbiddenException(
          'This channel is private, please provide a password',
        );
      const passwordMatches = await argon.verify(
        room.password,
        roomDTO.password,
      );
      if (!passwordMatches) throw new ForbiddenException('Password incorrect');
    }
  }

  /****************************************************************************/
  /* leave channel										                                        */
  /****************************************************************************/

  async leaveChannel(client: Socket, dto: channelDTO) {
    const email: string = this.getEmailFromJWT(client);
    const chatuser: ChatUser = await this.fetchChatuser(email);
    const prismaUser: UserWithRooms = await this.fetchPrismaUserWithRooms(
      chatuser.email,
    );
    let userInRoom: UserInRoom;

    // Some security checks
    try {
      userInRoom = await this.securityCheckLeaveChannel(prismaUser, dto);
    } catch (error) {
      throw error;
    }

    // unjoin socket
    client.leave(dto.name);

    // remove room user
    await this.prisma.userInRoom.delete({
      where: {
        id: userInRoom.id,
      },
    });

    // update channel that user has left
    await this.sendServerMessage({
      room: dto.name,
      text: `User ${prismaUser.userName} has left this channel.`,
    });
  }

  async securityCheckLeaveChannel(prismaUser: User, dto: channelDTO) {
    // check if user exists
    if (!prismaUser)
      throw new BadRequestException(
        'Your account has been deleted. Please register again.',
      );

    // catch prisma error when variables are not correct
    let room: RoomWithUsers;
    try {
      room = await this.prisma.room.findUnique({
        where: {
          name: dto.name,
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Channel not found, did you send the right variables?',
      );
    }

    // check if room exists
    if (!room) throw new BadRequestException('This channel does not exist');

    // check if user is on channel
    const userInRoom = await room.users.find((roomUser: UserInRoom) => {
      return roomUser.email === prismaUser.email;
    });
    if (!userInRoom) throw new BadRequestException('You are not in this room');

    // check if user can leave this room
    if (room.status === RoomStatus.DIRECT)
      throw new ForbiddenException(
        'Not possible to leave a private conversation, you can block the other person in stead.',
      );

    return userInRoom;
  }

  /****************************************************************************/
  /* messages													                                        */
  /****************************************************************************/

  async sendServerMessage(message: messageDTO) {
    try {
      // Create the new message in the database
      await this.prisma.message.create({
        data: {
          ...message,
          sender: 'PongStoryShort',
          room: {
            connect: {
              name: message.room,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }

    const newMessage = new ChatMessage(
      message.room,
      'PongStoryShort',
      message.text,
    );

    this.server.to(message.room).emit('newMessage', JSON.stringify(newMessage));
  }

  async stockMessage(client: Socket, message: messageDTO) {
    const email: string = this.getEmailFromJWT(client);
    const prismaUser: UserWithRooms = await this.fetchPrismaUserWithRooms(
      email,
    );

    try {
      // check if user and room exist
      const room: Room = await this.checkUserRoom(prismaUser, message);

      // check if user is allowed to send a message to this channel
      await this.allowedToSend(room, prismaUser);

      // check message format and add sender name
      const checkedMessage = new ChatMessage(
        room.name,
        prismaUser.userName,
        message.text,
      );
      if (!checkedMessage)
        throw new BadRequestException(
          'Message could not be sent, did you add the right variables?',
        );

      // add message to room in database
      await this.prisma.message.create({
        data: {
          ...checkedMessage,
          room: {
            connect: {
              name: room.name,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async checkUserRoom(user: UserWithRooms, message: messageDTO): Promise<Room> {
    // check if sender exists
    if (!user) throw new NotFoundException('User not found');

    // check if room exists
    try {
      const room: Room | null = await this.prisma.room.findUnique({
        where: {
          name: message.room,
        },
      });

      if (!room) throw new NotFoundException('Room not found');

      return room;
    } catch (error) {
      throw new BadRequestException(
        'Channel not found, did you send the right variables?',
      );
    }
  }

  async allowedToSend(room: Room, user: UserWithRooms) {
    // check if user is in room
    const userInRoom = await user.rooms.find((roomUser: UserInRoom) => {
      return roomUser.roomID === room.name;
    });

    if (!userInRoom) throw new NotFoundException('You are not in this room');

    if (room.status !== RoomStatus.DIRECT) {
      // check if sender is muted
      if (userInRoom.isMuted)
        throw new ForbiddenException(
          'You have been temporarily muted by a channel admin. Retry sending your message later.',
        );

      // check if sender is banned
      if (userInRoom.isBanned)
        throw new ForbiddenException(
          "You have been banned from this channel, so don't even try...",
        );
    } else {
      // check if user has been blocked.
      // not sure if I shouldn't save the message when sender has been blocked
      // because the subject says we have to 'hide' messages of blocked users
    }
  }
}
