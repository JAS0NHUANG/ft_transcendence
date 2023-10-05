import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'nestjs-prisma';
import { Cache } from 'cache-manager';

import { User, Game as prismaGame } from '@prisma/client';
import { Game, GameStatus, Player } from '../dto/game.dto';
import { GameService } from '../game/game.service';

@WebSocketGateway({
  cors: {
    origin: [`${process.env.FRONTEND_URL}`],
  },
  namespace: 'game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly gameService: GameService,
    private prisma: PrismaService,
  ) {}
  @WebSocketServer()
  server: Server;
  pauseCounter = 300;

  /****************************************************************************/
  // handle connection
  /****************************************************************************/
  async handleConnection(client: Socket) {
    console.log(
      `\x1b[32m Socket: ${client.id} connect to Game Socket! \x1b[0m`,
    );
    if ((await this.gameService.identifyUser(client)) === 'failed') {
      client.disconnect();
    }
  }

  /****************************************************************************/
  // handle disconnection
  /****************************************************************************/
  async handleDisconnect(client: Socket) {
    await this.gameService.cancelPendingGame(client);
    await this.gameService.updateUserDisconnectStatus(client);
    await this.gameService.clearData(client);
    console.log(
      `\x1b[31m Socket: ${client.id} disconnect from Game Socket! \x1b[0m`,
    );
  }

  /****************************************************************************/
  // Find game
  /****************************************************************************/
  @SubscribeMessage('findGame')
  async handleFindGame(client: Socket) {
    let currentPlayer = await this.gameService.createPlayer(client);
    if (!currentPlayer) return;

    const pausedGameID = await this.gameService.findPausedGame(client);
    if (pausedGameID) currentPlayer.gameID = pausedGameID;

    let newGame: Game = await this.gameService.createGame(client);
    if (newGame) currentPlayer.gameID = newGame.gameID;

    const startGame: [boolean, string] =
      await this.gameService.findMatchingGame(currentPlayer);
    const gameRoom: string = startGame[1];
    client.join(gameRoom);

    if (startGame[0]) {
      this.server.to(gameRoom).emit('endWaitingState');
    }
  }

  /****************************************************************************/
  // GAME
  /****************************************************************************/
  @SubscribeMessage('setCanvas')
  handleSetCanvas(client: Socket, payload: any) {
    this.gameService.setCanvas(payload);
  }

  @SubscribeMessage('startGame')
  async handleStartGame(client: Socket, payload: Object): Promise<Object> {
    const currentPlayer = await this.gameService.getSocketPlayer(client);
    if (!currentPlayer) return;

    const gameRoom: string = currentPlayer.gameID;
    let gameData: Game;

    const gameInterval = setInterval(async () => {
      gameData = await this.gameService.gameLogic(client);
      if (!gameData) {
        clearInterval(gameInterval);
        return;
      }
      if (gameData.leftPlayer === null || gameData.rightPlayer === null) {
        clearInterval(gameInterval);
        return;
      }
      // also need to ubpdate the paddle for both sides.
      if (gameData.status === GameStatus.Pause) {
        this.server.to(gameRoom).emit('pause', this.pauseCounter);
        this.pauseCounter--;
        if (this.pauseCounter === 0) {
          gameData.status = GameStatus.Ended;
        }
      } else if (gameData.status === GameStatus.Ended) {
        this.server.to(gameRoom).emit('updateGame', gameData);
        this.server.to(gameRoom).emit('ended', gameData);
      } else {
        this.pauseCounter = 300;
        this.server.to(gameRoom).emit('updateGame', gameData);
      }

      if (gameData.status === GameStatus.Ended) {
        await this.gameService.endGame(gameData);
        clearInterval(gameInterval);
      }
    }, 1000 / 30);

    return { event: 'start game', socketID: client.id };
  }

  @SubscribeMessage('movePaddle')
  async handleMovePaddle(
    client: Socket,
    payload: { key: string; gameID: string },
  ): Promise<object> {
    console.log('got moveP event!');
    const gameData = await this.gameService.movePaddle(client, payload);
    if (!gameData) return;
    let updateSide = '';
    console.log('game Data to sent: ', gameData);

    if (
      gameData.currentGame.leftPlayer.socketID ===
      gameData.currentPlayer.socketID
    ) {
      updateSide = 'updateLeftPaddle';
    } else {
      updateSide = 'updateRightPaddle';
    }

    this.server
      .to(gameData.currentGame.rightPlayer.socketID)
      .emit(updateSide, gameData.currentPlayer.paddlePosition);
    this.server
      .to(gameData.currentGame.leftPlayer.socketID)
      .emit(updateSide, gameData.currentPlayer.paddlePosition);
    console.log(payload);
    console.log('Paddle movinnnnn!!!');
    return { event: 'player paddle move', socketID: client.id };
  }

  /****************************************************************************/
  // INVITE
  /****************************************************************************/

  @SubscribeMessage('inviteUserToPlay')
  async handleInvitePlayer(client: Socket, payload: string) {
    // find and check the "invited" user
    const invitedUserEmail: string = payload;
    const user: User = await this.gameService.getSocketUser(client);
    if (!invitedUserEmail || invitedUserEmail === '') {
      this.server
        .to(client.id)
        .emit('errorGameInvite', { error: 'User Email not provided.' });
      return;
    }
    const invitedUserStatus: string =
      await this.gameService.checkInvitedUserStatus(client, invitedUserEmail);
    if (invitedUserStatus === 'ONLINE') {
      this.server
        .to(client.id)
        .emit('invitationSent', { invitedUserEmail: payload });
    } else {
      this.server
        .to(client.id)
        .emit('errorGameInvite', { error: invitedUserStatus });
      return;
    }

    // create the game and wait
    console.log('create inviting game and wait');
    const invitingPlayer: Player = await this.gameService.createPlayer(client);
    const invitingGame: Game = await this.gameService.createInvitingGame(
      invitingPlayer,
    );
    console.log(invitingGame);
    if (invitingGame) {
      client.join(invitingGame.gameID);
      const invitedUserSocketID: string = await this.cacheManager.get(
        `game${invitedUserEmail}`,
      );
      this.server
        .to(invitedUserSocketID)
        .emit('gameInvite', { invitedBy: invitingPlayer.email });
    }
  }

  // Make accept/decline seperately so the payload can be a simple string

  @SubscribeMessage('acceptInvitation')
  async handleAcceptInvitation(client: Socket, payload: string) {
    // create the invitedPlayer
    const invitedPlayer: Player = await this.gameService.createPlayer(client);
    const invitingPlayer: Player = await this.gameService.getPlayerByEmail(
      payload,
    );
    if (!invitingPlayer) {
      this.server
        .to(invitedPlayer.socketID)
        .emit('errorGameInvite', { error: 'Player has left' });
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: invitingPlayer.email,
      },
    });
    if (user.status !== 'WAITING') {
      this.server
        .to(invitedPlayer.socketID)
        .emit('errorGameInvite', { error: 'Player not available anymore' });
      return;
    }
    client.join(invitingPlayer.gameID);

    const inviteGameStarted = await this.gameService.joinGameAndLaunch(
      invitedPlayer,
      invitingPlayer.gameID,
    );
    if (inviteGameStarted) {
      this.server.to(invitingPlayer.socketID).emit('invitationAccepted');
    } else {
      this.server
        .to(invitedPlayer.socketID)
        .emit('errorGameInvite', { error: 'Game has been deleted' });
    }
  }

  @SubscribeMessage('declineInvitation')
  async handleDeclineInvitation(client: Socket, payload: string) {
    console.log('invitation declined!');
    if (!payload) {
      return;
    }
    const invitingPlayer: Player = await this.gameService.getPlayerByEmail(
      payload,
    );
    if (invitingPlayer) {
      this.server.to(invitingPlayer.socketID).emit('invitationDeclined');
      const invitingGame: Game = await this.gameService.getGameByID(
        invitingPlayer.gameID,
      );
      if (invitingGame) {
        await this.cacheManager.del(`game${invitingGame.gameID}`);
        await this.cacheManager.del(`invite${invitingPlayer.email}`);
      }
    }
  }

  /****************************************************************************/
  /* CHAT                                                                     */
  /****************************************************************************/

  @SubscribeMessage('message')
  handleMessageReceived(client: Socket, payload: Object): Object {
    console.log(payload);
    console.log('Message received!!!');
    return { event: 'player message receivedt ', socketID: client.id };
  }
}
