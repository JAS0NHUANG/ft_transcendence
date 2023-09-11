import { Injectable, Res, BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  /*****************************************************************************/
  /* send friend Request */
  /*****************************************************************************/
  async sendFriendRequest(
    sender: User,
    receiver: { userName: string },
    res: any,
  ) {
    if (!receiver || !receiver.userName) {
      return { status: 'Bad request', statusCode: 400 };
    }

    // find the receiver's name first
    const hasReceiver = await this.prisma.user.findUnique({
      where: {
        userName: receiver.userName,
      },
    });
    if (!hasReceiver) throw new BadRequestException('No such user.');

    try {
      const alreadyRequest = await this.prisma.user.findMany({
        where: {
          userName: receiver.userName,
          OR: [
            {
              friends: {
                hasEvery: [sender.userName],
              },
            },
            {
              friendRequestsReceived: {
                hasEvery: [sender.userName],
              },
            },
          ],
        },
      });
      if (alreadyRequest.length) {
        console.log('already', alreadyRequest);
        return { status: 'Request already sent', statusCode: 200 };
      }
      const updateReceiver = await this.prisma.user.update({
        where: {
          userName: receiver.userName,
        },
        data: {
          friendRequestsReceived: {
            push: sender.userName,
          },
        },
      });
      const updateSender = await this.prisma.user.update({
        where: {
          userName: sender.userName,
        },
        data: {
          friendRequestsSent: {
            push: receiver.userName,
          },
        },
      });
    } catch (error) {
      throw error;
    }
    return { status: 'OK', statusCode: 200 };
  }

  /*****************************************************************************/
  /* cancel sent friend Request */
  /*****************************************************************************/
  async cancelFriendRequest(
    sender: User,
    receiver: { userName: string },
    res: any,
  ) {
    // get the friendRequestsReceived list
    const { friendRequestsReceived } = await this.prisma.user.findUnique({
      where: {
        userName: receiver.userName,
      },
      select: {
        friendRequestsReceived: true,
      },
    });
    // remove the sender's userName from receiver's friendRequestsReceived array
    // filter out the sender and update/set the list
    const updateReceiver = await this.prisma.user.update({
      where: {
        userName: receiver.userName,
      },
      data: {
        friendRequestsReceived: {
          set: friendRequestsReceived.filter(
            (userName) => userName !== sender.userName,
          ),
        },
      },
    });

    // get the friendRequestsSent list
    const { friendRequestsSent } = await this.prisma.user.findUnique({
      where: {
        userName: sender.userName,
      },
      select: {
        friendRequestsSent: true,
      },
    });
    // remove receiverUserName from friendRequestSent array
    // filter out the sender and update/set the list
    const updateSender = await this.prisma.user.update({
      where: {
        userName: sender.userName,
      },
      data: {
        friendRequestsSent: {
          set: friendRequestsSent.filter(
            (userName) => userName !== receiver.userName,
          ),
        },
      },
    });
    return { status: 'OK', statusCode: 200 };
  }

  /*****************************************************************************/
  // accept friend Request
  /*****************************************************************************/
  async acceptFriendRequest(
    receiver: User,
    sender: { userName: string },
    res: any,
  ) {
    const remover = this.cancelFriendRequest(receiver, sender, res);

    try {
      const addFriend = await this.prisma.user.update({
        where: {
          userName: receiver.userName,
        },
        data: {
          friends: {
            push: sender.userName,
          },
        },
      });
    } catch (error) {
      throw error;
    }
    return { status: 'OK', statusCode: 200 };
  }
}
