import { Inject, Injectable, forwardRef, CACHE_MANAGER } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Cache } from 'cache-manager';

import { Game } from '../dto/game.dto';
import { Player } from '../dto/game.dto';

const generateAngle = (x: number, y: number) => {
  let angle = Math.random() * Math.PI * 2;
  console.log('init angle: ', angle);
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
  console.log('mod angle: ', angle);
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

@Injectable()
export class GameService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  // this should all be stored in the cache:
  private canvas: {
    canvasHeight: number;
    canvasWidth: number;
    paddleHeight: number;
    paddleWidth: number;
    paddleX: number;
  } = {
    canvasHeight: 0,
    canvasWidth: 0,
    paddleHeight: 0,
    paddleWidth: 0,
    paddleX: 0,
  };

  private players: Player[] = [];
  private games: Game[] = [];
  private startPaddle: number = 165;
  private gameIDcounter: number = 0;

  joinOrCreateGame(client: string) {
    const availableGame = this.games.find((game) => game.nbPlayers === 1);
    console.log('the available game: ', availableGame);
    if (availableGame) {
      const newPlayer = new Player(
        client,
        availableGame.gameID,
        this.startPaddle,
      );
      this.players.push(newPlayer);
      availableGame.rightPlayer = newPlayer;
      availableGame.nbPlayers++;
      return [
        availableGame.leftPlayer.socketID,
        availableGame.rightPlayer.socketID,
      ];
    } else {
      const newPlayer = new Player(
        client,
        this.gameIDcounter,
        this.startPaddle,
      );
      const newGame = new Game(
        this.gameIDcounter,
        1,
        newPlayer,
        null,
        [0, 0],
        {
          x: 400,
          y: 400,
        },
        {
          x: 7,
          y: 7,
        },
        generateAngle(7, 7),
        'playig',
      );
      this.gameIDcounter++;
      this.games.push(newGame);
      console.log(newGame.ballAngle);
      this.players.push(newPlayer);
    }
  }

  initGame(client: string) {}

  setCanvas({
    canvasHeight,
    canvasWidth,
    paddleHeight,
    paddleWidth,
    paddleX,
  }: {
    canvasHeight: number;
    canvasWidth: number;
    paddleHeight: number;
    paddleWidth: number;
    paddleX: number;
  }) {
    this.canvas.canvasHeight = canvasHeight;
    this.canvas.canvasWidth = canvasWidth;
    this.canvas.paddleHeight = paddleHeight;
    this.canvas.paddleWidth = paddleWidth;
    this.canvas.paddleX = paddleX;
    this.startPaddle = canvasHeight / 2 - paddleHeight / 2;
  }

  movePaddle(client: Socket, payload: Object) {
    const currentPlayer = this.players.find(
      (player) => player.socketID === client.id,
    );

    if (!currentPlayer) {
      console.log('error');
      return;
    } else {
      if (!currentPlayer.paddlePosition) {
        console.log('no pad pos');
        currentPlayer.paddlePosition = 165;
      }
      if (payload === 'up') {
        if (currentPlayer.paddlePosition - 5 >= 0) {
          currentPlayer.paddlePosition = currentPlayer.paddlePosition - 5;
        }
      } else if (payload === 'down') {
        if (currentPlayer.paddlePosition + 5 < 325) {
          currentPlayer.paddlePosition = currentPlayer.paddlePosition + 5;
        }
      }

      const currentGame = this.games.find(
        (game) => game.gameID === currentPlayer.gameID,
      );
      return { currentGame: currentGame, currentPlayer: currentPlayer };
    }
  }

  gameLogic(client: Socket) {
    const currentPlayer = this.players.find(
      (player) => player.socketID === client.id,
    );
    const currentGame = this.games.find(
      (game) => game.gameID === currentPlayer.gameID,
    );

    if (!currentGame) {
      return null;
    }

    // ball hits paddle
    if (
      currentGame.ballPosition.x <= 54 &&
      currentGame.ballPosition.x > 47 &&
      currentGame.ballPosition.y / 2 - currentGame.leftPlayer.paddlePosition >=
        -5 &&
      currentGame.ballPosition.y / 2 - currentGame.leftPlayer.paddlePosition <=
        this.canvas.paddleHeight + 5
    ) {
      currentGame.ballDirection.x *= -1;
      currentGame.ballPosition.x +=
        Math.cos(currentGame.ballAngle) * currentGame.ballDirection.x;
      currentGame.ballPosition.y +=
        Math.sin(currentGame.ballAngle) * currentGame.ballDirection.y;
      return currentGame;
    }

    if (
      currentGame.ballPosition.x >= 748 &&
      currentGame.ballPosition.x < 755 &&
      currentGame.ballPosition.y / 2 - currentGame.rightPlayer.paddlePosition >=
        -5 &&
      currentGame.ballPosition.y / 2 - currentGame.rightPlayer.paddlePosition <=
        this.canvas.paddleHeight + 5
    ) {
      currentGame.ballDirection.x *= -1;
      currentGame.ballPosition.x +=
        Math.cos(currentGame.ballAngle) * currentGame.ballDirection.x;
      currentGame.ballPosition.y +=
        Math.sin(currentGame.ballAngle) * currentGame.ballDirection.y;
      return currentGame;
    }

    // ball pass the paddles
    if (currentGame.ballPosition.x <= 10) {
      currentGame.ballPosition.x = 400;
      currentGame.ballPosition.y = 400;
      currentGame.score[1] += 1;
      currentGame.ballAngle = generateAngle(
        currentGame.ballPosition.x,
        currentGame.ballPosition.y,
      );
    }
    if (currentGame.ballPosition.x >= 790) {
      currentGame.ballPosition.x = 400;
      currentGame.ballPosition.y = 400;
      currentGame.score[0] += 1;
      currentGame.ballAngle = generateAngle(
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
      currentGame.status = 'ended';
    }

    return currentGame;
  }

  /*
  async getGameDataFromCache(gameID: string): Object {
    const gameData: string = await this.cacheManager.get(body.gameID);
    if (gameData) {
      const gameDataJSON = JSON.parse(gameData);
      return gameDataJSON;
    }
    return null;
  }

  async setGameDataToCache(gameID: string, newGameData: Object): void {
    const gameData: string = await this.cacheManager.get(body.gameID);
    if (gameData) {
      await this.cacheManager.del(body.gameID);
      await this.cacheManager.set(
        body.gameID,
        JSON.stringify(gameDataJSON),
      );
    }
  }
*/
}
