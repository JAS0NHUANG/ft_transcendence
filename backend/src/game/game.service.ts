import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { Game, GameStatus, Player } from '../dto/game.dto';
import { User, Game as prismaGame } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // this should all be stored in the cache:
  private canvas: {
    canvasHeight: number;
    paddleHeight: number;
  } = {
    canvasHeight: 0,
    paddleHeight: 0,
  };

  private startPaddle: number = 165;

  /****************************************************************************/
  // User Validation and query
  /****************************************************************************/
  async identifyUser(client: Socket): Promise<string> {
    // check JWT
    const jwt = client.handshake.headers.authorization;
    let jwtData: { sub: string; email: string; iat: string; exp: string } | any;
    if (jwt === 'undefined' || jwt === null) {
      return 'failed';
    }
    jwtData = this.jwtService.decode(jwt);
    if (!jwtData || typeof jwtData !== 'object') {
      return 'failed';
    }
    const user: User = await this.getUserByEmail(jwtData.email);
    if (!user) {
      return 'failed';
    }
    await this.cacheManager.set(client.id, user.email);
    return 'OK';
  }

  async getUserByEmail(email: string): Promise<User> {
    let user: User;
    try {
      user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
    } catch (error) {
      throw error;
    }
    return user;
  }

  async getSocketUser(client: Socket): Promise<User> {
    // only works after {socketID, userEmail} stored into cache
    const userEmail: string = await this.cacheManager.get(client.id);
    if (!userEmail) {
      return null;
    }

    const user: User = await this.getUserByEmail(userEmail);
    return user;
  }

  /****************************************************************************/
  // Disconnection
  /****************************************************************************/
  async cancelPendingGame(client: Socket) {
    const playerEmail: string = await this.cacheManager.get(client.id);

    const pendingPlayer: string = await this.cacheManager.get('pendingPlayer');
    console.log('DISCONNECT PENDING P:   ', pendingPlayer);
    if (pendingPlayer) {
      try {
        const pendingPlayerObject: Player = JSON.parse(pendingPlayer);
        if (pendingPlayerObject.email === playerEmail) {
          console.log('CLEARING THE PENDING PLAYER AND GAME!!!!');
          await this.cacheManager.del('pendingPlayer');
          await this.cacheManager.del(`game${playerEmail}`);
          await this.cacheManager.del(pendingPlayerObject.gameID);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async updateUserDisconnectStatus(client: Socket) {
    // find the user in database
    const user: User = await this.getSocketUser(client);
    if (!user) {
      return;
    }
    if (user.status === 'WAITING' || user.status === 'PLAYING') {
      try {
        await this.prisma.user.update({
          where: {
            email: user.email,
          },
          data: {
            status: 'AWAY',
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async clearData(client: Socket) {
    console.log('cleaning!!');
    const player = await this.getSocketPlayer(client);
    if (!player) return;

    const game: Game = await this.getGameByID(player.gameID);
    if (game && game.status === GameStatus.Ended) {
      await this.cacheManager.del(`game${game.gameID}`);
    }
    if (player.gameID === '') {
      await this.cacheManager.del(`game${player.email}`);
    } else {
      await this.pauseGame(player.gameID);
    }
    await this.cacheManager.del(client.id);
  }

  async pauseGame(gameID: string) {
    const game = await this.getGameByID(gameID);
    if (!game) return;
    game.status = GameStatus.Pause;
    await this.cacheManager.set(gameID, JSON.stringify(game));
  }

  /****************************************************************************/
  // Create, Update Player(before finding a game)
  /****************************************************************************/
  async getPlayerByEmail(email: string): Promise<Player> {
    let player: Player;
    const playerString: string = await this.cacheManager.get(`game${email}`);
    if (playerString) {
      try {
        player = JSON.parse(playerString);
      } catch (error) {
        console.log(error);
      }
    }
    return player;
  }

  async getSocketPlayer(client: Socket) {
    let player: Player;
    const playerEmail: string = await this.cacheManager.get(client.id);
    const playerString: string = await this.cacheManager.get(
      `game${playerEmail}`,
    );
    if (playerString) player = JSON.parse(playerString);
    return player;
  }

  async createPlayer(client: Socket): Promise<Player> {
    const pausingPlayer = await this.updatePausingPlayer(client);
    console.log('has pausing player: ', pausingPlayer);
    if (pausingPlayer) return pausingPlayer;

    const user: User = await this.getSocketUser(client);
    if (!user) return;
    const newPlayer = new Player(
      '',
      user.email,
      client.id,
      user.userName,
      this.startPaddle,
    );
    // save the new Player in redis
    await this.cacheManager.set(`game${user.email}`, JSON.stringify(newPlayer));
    return newPlayer;
  }

  async updatePausingPlayer(client: Socket): Promise<Player> {
    const pausingPlayer = await this.getSocketPlayer(client);

    if (pausingPlayer && pausingPlayer.gameID !== '') {
      pausingPlayer.socketID = client.id;
      await this.cacheManager.set(
        `game${pausingPlayer.email}`,
        JSON.stringify(pausingPlayer),
      );
    }
    return pausingPlayer;
  }

  /****************************************************************************/
  // find, create, join game
  /****************************************************************************/
  async getGameByID(gameID: string): Promise<Game> {
    let game: Game;
    const gameString: string = await this.cacheManager.get(gameID);
    if (gameString && gameString !== '') game = JSON.parse(gameString);
    return game;
  }

  async findPausedGame(client: Socket): Promise<string> {
    let gameID: string;
    const user: User = await this.getSocketUser(client);
    if (!user) {
      return '';
    }
    const pausingPlayer: string = await this.cacheManager.get(
      `game${user.email}`,
    );
    if (pausingPlayer) {
      let pausingPlayerObject: Player = JSON.parse(pausingPlayer);
      if (pausingPlayerObject.gameID !== '') {
        pausingPlayerObject.socketID = client.id;
        await this.cacheManager.set(
          `game${user.email}`,
          JSON.stringify(pausingPlayerObject),
        );
        console.log(pausingPlayerObject);
        console.log(
          'Socket: existing player updated: ',
          pausingPlayerObject.email,
        );
        gameID = pausingPlayerObject.gameID;
      }
    }
    console.log('has paused game: ', gameID);
    return gameID;
  }

  async createGame(client: Socket): Promise<Game> {
    let newGame: Game;
    let pendingPlayer: string = await this.cacheManager.get('pendingPlayer');
    // continue to joinGame if there is a pendingPlayer
    let pausedGameID: string = await this.findPausedGame(client);
    console.log('paused game in create game: ', pausedGameID);
    if (!pendingPlayer && !pausedGameID) {
      let player: Player = await this.getSocketPlayer(client);
      if (player) {
        console.log('create a pending game');
        newGame = await this.createWaitingGame(player);
      }
    }
    console.log('game CREATEEEDDDD!!!!!!');
    return newGame;
  }

  async createWaitingGame(player: Player): Promise<Game> {
    const gameID = `game${player.socketID}`;
    const newGame = new Game(
      gameID,
      1,
      player,
      null,
      [8, 8],
      { x: 400, y: 400 },
      { x: 3, y: 3 },
      this.generateAngle(1, 1),
      GameStatus.Waiting,
    );
    player.gameID = gameID;
    try {
      await this.prisma.user.update({
        where: {
          email: player.email,
        },
        data: {
          status: 'WAITING',
        },
      });
    } catch (err) {
      console.log(err);
    }
    this.cacheManager.set(gameID, JSON.stringify(newGame));
    this.cacheManager.set(`game${player.email}`, JSON.stringify(player));
    await this.cacheManager.set('pendingPlayer', JSON.stringify(player));
    return newGame;
  }

  async findMatchingGame(player: Player): Promise<[boolean, string]> {
    let pendingPlayer: string = await this.cacheManager.get('pendingPlayer');
    // Check if pending player exists, is available and is not current player
    if (pendingPlayer) {
      console.log('pending player existeddddddddddddddddddddddddd!');
      const otherPlayer = JSON.parse(pendingPlayer);
      const user: User = await this.prisma.user.findUnique({
        where: {
          email: otherPlayer.email,
        },
      });
      if (user.status !== 'WAITING') {
        this.cacheManager.del('pendingPlayer');
        pendingPlayer = undefined;
      }
      if (otherPlayer.userName === player.userName) {
        console.log('It is the same Player:', player);
        this.cacheManager.set('pendingPlayer', JSON.stringify(player));
        return [false, player.gameID];
      }
    }

    // Matching
    if (player && player.gameID !== '') {
      this.joinGameAndLaunch(player, player.gameID);
      return [true, player.gameID];
    } else {
      const otherPlayer = JSON.parse(pendingPlayer);
      this.cacheManager.del('pendingPlayer');
      const gameID = otherPlayer.gameID;
      this.joinGameAndLaunch(player, gameID);
      return [true, otherPlayer.gameID];
    }
  }

  async joinGameAndLaunch(player: Player, gameID: string): Promise<boolean> {
    const game = await this.getGameByID(gameID);

    if (game) {
      console.log('join game:', game);
      player.gameID = gameID;
      this.cacheManager.set(`game${player.email}`, JSON.stringify(player));
      if (
        game.rightPlayer === null ||
        game.rightPlayer.email === player.email
      ) {
        game.rightPlayer = player;
      } else {
        game.leftPlayer = player;
      }
      try {
        await this.prisma.user.updateMany({
          where: {
            email: {
              in: [game.leftPlayer.email, game.rightPlayer.email],
            },
          },
          data: {
            status: 'PLAYING',
          },
        });
      } catch (error) {
        throw new InternalServerErrorException('User state update failed');
      }
      game.status = GameStatus.Playing;
      this.cacheManager.set(gameID, JSON.stringify(game));
      return true;
    } else {
      return false;
    }
  }

  /****************************************************************************/
  // INVITE
  /****************************************************************************/
  async checkInvitedUserStatus(
    client: Socket,
    userEmail: string,
  ): Promise<string> {
    let result: string;
    const invitingUser: User = await this.getSocketUser(client);
    const invitedUser: User = await this.getUserByEmail(userEmail);
    if (invitedUser && invitingUser) {
      if (invitedUser.email === invitingUser.email) {
        result = 'Can not invite your self.';
      } else if (invitedUser.status === 'ONLINE') {
        result = invitedUser.status;
      } else {
        result = 'User not available.';
      }
    } else {
      result = 'User not found.';
    }
    return result;
  }

  async createInvitingGame(player: Player): Promise<Game> {
    const gameID = `game${player.socketID}`;
    const newGame = new Game(
      gameID,
      1,
      player,
      null,
      [8, 8],
      { x: 400, y: 400 },
      { x: 3, y: 3 },
      this.generateAngle(1, 1),
      GameStatus.Waiting,
    );
    player.gameID = gameID;
    try {
      await this.prisma.user.update({
        where: {
          email: player.email,
        },
        data: {
          status: 'WAITING',
        },
      });
    } catch (err) {
      console.log(err);
    }
    this.cacheManager.set(gameID, JSON.stringify(newGame));
    this.cacheManager.set(`game${player.email}`, JSON.stringify(player));
    await this.cacheManager.set(
      `invite${player.email}`,
      JSON.stringify(player),
    );
    return newGame;
  }

  /****************************************************************************/
  /* GAMEPLAY                                                                 */
  /****************************************************************************/
  setCanvas({
    canvasHeight,
    paddleHeight,
  }: {
    canvasHeight: number;
    paddleHeight: number;
  }) {
    this.canvas.canvasHeight = canvasHeight;
    this.canvas.paddleHeight = paddleHeight;
    this.startPaddle = canvasHeight / 2 - paddleHeight / 2;
  }

  async movePaddle(client: Socket, payload: { key: string; gameID: string }) {
    const currentGame = await this.getGameByClient(client);
    console.log('move currG', client.id);
    if (!currentGame) return;
    console.log('move currG', currentGame);

    const currentPlayer =
      currentGame.leftPlayer.socketID === client.id
        ? currentGame.leftPlayer
        : currentGame.rightPlayer;

    if (!currentPlayer) {
      return;
    } else {
      if (!currentPlayer.paddlePosition) {
        console.log('no pad pos');
        currentPlayer.paddlePosition = 165;
      }
      if (payload.key === 'up') {
        if (currentPlayer.paddlePosition - 5 > 0) {
          currentPlayer.paddlePosition = currentPlayer.paddlePosition - 5;
        }
      } else if (payload.key === 'down') {
        if (currentPlayer.paddlePosition + 5 < 325) {
          currentPlayer.paddlePosition = currentPlayer.paddlePosition + 5;
        }
      }

      await this.cacheManager.set(
        currentGame.gameID,
        JSON.stringify(currentGame),
      );
      return { currentGame: currentGame, currentPlayer: currentPlayer };
    }
  }

  //checkBallPaddleCollision
  // moveBall()

  async gameLogic(client: Socket): Promise<Game> {
    const currentGame = await this.getGameByClient(client);

    if (!currentGame) {
      return null;
    }
    const currentPlayer =
      currentGame.leftPlayer.socketID === client.id
        ? currentGame.leftPlayer
        : currentGame.rightPlayer;

    if (currentGame.status === GameStatus.Pause) {
      return currentGame;
    }
    // ball hits paddle
    // left
    if (
      currentGame.ballPosition.x <= 54 &&
      currentGame.ballPosition.x >= 50 &&
      currentGame.ballPosition.y / 2 - currentGame.leftPlayer.paddlePosition >=
        -5 &&
      currentGame.ballPosition.y / 2 - currentGame.leftPlayer.paddlePosition <=
        this.canvas.paddleHeight + 5
    ) {
      console.log('hit left paddle');
      if (Math.random() < 0.5) {
        currentGame.ballAngle += (Math.random() / 2) % 6;
      } else {
        currentGame.ballAngle -= (Math.random() / 2) % 6;
      }
      currentGame.ballAngle = Math.abs(currentGame.ballAngle);
      if (currentGame.ballAngle < 2) {
        currentGame.ballAngle += 2;
      }
      if (currentGame.ballAngle > 5) {
        currentGame.ballAngle -= 2;
      }
      currentGame.ballDirection.x *= -1;
      currentGame.ballPosition.x +=
        Math.cos(currentGame.ballAngle) * currentGame.ballDirection.x + 5;
      currentGame.ballPosition.y +=
        Math.sin(currentGame.ballAngle) * currentGame.ballDirection.y;
      await this.cacheManager.set(
        currentGame.gameID,
        JSON.stringify(currentGame),
      );
      return currentGame;
    }

    if (
      currentGame.ballPosition.x >= 748 &&
      currentGame.ballPosition.x <= 752 &&
      currentGame.ballPosition.y / 2 - currentGame.rightPlayer.paddlePosition >=
        -5 &&
      currentGame.ballPosition.y / 2 - currentGame.rightPlayer.paddlePosition <=
        this.canvas.paddleHeight + 5
    ) {
      if (Math.random() < 0.5) {
        currentGame.ballAngle += (Math.random() / 2) % 6;
      } else {
        currentGame.ballAngle -= (Math.random() / 2) % 6;
      }
      currentGame.ballAngle = Math.abs(currentGame.ballAngle);
      if (currentGame.ballAngle < 2) {
        currentGame.ballAngle += 2;
      }
      if (currentGame.ballAngle > 5) {
        currentGame.ballAngle -= 2;
      }
      currentGame.ballDirection.x *= -1;
      currentGame.ballPosition.x +=
        Math.cos(currentGame.ballAngle) * currentGame.ballDirection.x - 5;
      currentGame.ballPosition.y +=
        Math.sin(currentGame.ballAngle) * currentGame.ballDirection.y;
      await this.cacheManager.set(
        currentGame.gameID,
        JSON.stringify(currentGame),
      );
      return currentGame;
    }

    // ball pass the paddles
    if (currentGame.ballPosition.x <= 10) {
      currentGame.ballPosition.x = 400;
      currentGame.ballPosition.y = 400;
      currentGame.score[1] += 1;
      currentGame.ballAngle = this.generateAngle(
        currentGame.ballPosition.x,
        currentGame.ballPosition.y,
      );
    }
    if (currentGame.ballPosition.x >= 790) {
      currentGame.ballPosition.x = 400;
      currentGame.ballPosition.y = 400;
      currentGame.score[0] += 1;
      currentGame.ballAngle = this.generateAngle(
        currentGame.ballPosition.x,
        currentGame.ballPosition.y,
      );
    }

    if (currentGame.ballPosition.y < 7 || currentGame.ballPosition.y >= 793) {
      currentGame.ballDirection.y *= -1;
    }

    currentGame.ballPosition.x +=
      Math.cos(currentGame.ballAngle) * currentGame.ballDirection.x;
    currentGame.ballPosition.y +=
      Math.sin(currentGame.ballAngle) * currentGame.ballDirection.y;

    if (currentGame.score[0] === 11 || currentGame.score[1] === 11) {
      console.log('end');
      currentGame.status = GameStatus.Ended;
    }

    await this.cacheManager.set(
      currentGame.gameID,
      JSON.stringify(currentGame),
    );
    return currentGame;
  }

  /****************************************************************************/
  /* GAME END                                                                 */
  /****************************************************************************/
  async endGame(game: Game) {
    console.log('Game finished! Clean up!');
    await this.deletePlayers(game);
    await this.saveGameStats(game);
    console.log('end Game: ', game);
    await this.deleteGame(game.gameID);
  }

  async deleteGame(gameID: string) {
    const game = await this.getGameByID(gameID);

    if (game) {
      console.log('deleting game: ', game);
      await this.prisma.user.updateMany({
        where: {
          email: {
            in: [game.leftPlayer.email, game.rightPlayer.email],
          },
        },
        data: {
          status: 'ONLINE',
        },
      });

      this.cacheManager.del(gameID);
    }
  }

  async deletePlayers(game: Game) {
    await this.cacheManager.del(`game${game.leftPlayer.email}`);
    await this.cacheManager.del(`game${game.rightPlayer.email}`);
  }

  async getGameByClient(client: Socket): Promise<Game> {
    const userEmail = await this.cacheManager.get(client.id);
    const playerString: string = await this.cacheManager.get(
      `game${userEmail}`,
    );
    if (!playerString) return null;
    const player: Player = JSON.parse(playerString);
    const game: Game = await this.getGameByID(player.gameID);
    return game;
  }

  /****************************************************************************/
  /* GAME STATS                                                               */
  /****************************************************************************/
  async saveGameStats(game: Game) {
    const leftPlayer = await this.prisma.user.findUnique({
      where: {
        email: game.leftPlayer.email,
      },
      include: {
        games: {},
      },
    });
    const rightPlayer = await this.prisma.user.findUnique({
      where: {
        email: game.rightPlayer.email,
      },
      include: {
        games: {},
      },
    });
    const winner = game.score[0] > game.score[1] ? leftPlayer : rightPlayer;
    const loser = game.score[1] > game.score[0] ? leftPlayer : rightPlayer;
    console.log('this games is won by', winner.id, winner.userName);

    const dbGame = await this.prisma.game.create({
      data: {
        players: {
          connect: [{ email: leftPlayer.email }, { email: rightPlayer.email }],
        },
        winnerId: winner.userName,
        loserId: loser.userName,
      },
    });

    this.updatePlayerStats(leftPlayer, dbGame);
    this.updatePlayerStats(rightPlayer, dbGame);
  }

  async updatePlayerStats(player: User, dbGame: prismaGame) {
    console.log(player.achievements);
    if (
      player.id === dbGame.winnerId &&
      !player.achievements.includes('WINNER')
    ) {
      try {
        await this.prisma.user.update({
          where: {
            email: player.email,
          },
          data: {
            achievements: {
              push: 'WINNER',
            },
          },
        });
      } catch (err) {
        console.log(err);
      }
    }

    player.id === dbGame.winnerId ? player.gamesWon++ : player.gamesLost++;
    try {
      await this.prisma.user.update({
        where: {
          email: player.email,
        },
        data: {
          gamesLost: player.gamesLost,
          gamesWon: player.gamesWon,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  /****************************************************************************/
  // helper functions
  /****************************************************************************/
  generateAngle = (x: number, y: number) => {
    let angle = Math.random() * Math.PI * 2;
    console.log('init angle: ', angle);
    angle = this.modifyAngle(angle);
    if (x > 0 && y > 0) {
      return angle;
    } else if (x > 0 && y < 0) {
      return (angle += Math.PI / 2);
    } else if (x < 0 && y < 0) {
      return (angle += Math.PI);
    } else {
      return (angle += (Math.PI / 2) * 3);
    }
  };

  modifyAngle(angle) {
    if (angle > 3.5 && angle < 5) {
      if (angle > (Math.PI / 2) * 3) {
        angle += 1;
      } else {
        angle -= 1;
      }
    }
    if (angle > 0.6 && angle < 2.5) {
      if (angle > Math.PI / 2) {
        angle += 1;
      } else {
        angle -= 1;
      }
    }
    return Math.abs(angle);
  }
}
