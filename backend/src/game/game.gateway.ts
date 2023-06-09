import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://jas0nhuang.eu.org:3000',
      'http://jas0nhuang.eu.org:5173',
    ],
  },
  namespace: 'game',
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  /****************************************************************************/
  /* handle connection                                                        */
  /****************************************************************************/
  async handleConnection(client: Socket) {
    // await this.gameService.userConnect(client, this.server);
  }

  /****************************************************************************/
  /* handle disconnection                                                     */
  /****************************************************************************/
  async handleDisconnect(client: Socket) {
    console.log(client.id, ' disconnected.');
  }

  /****************************************************************************/
  /* player movements                                                         */
  /****************************************************************************/
  @SubscribeMessage('leftPlayerMove')
  handleLeftPlayerMove(
    @MessageBody() body: any,
    @ConnectedSocket() client: any,
  ) {
    // this.gameService.throttledPlayerMove(this.server, body, client, 'left');
  }

  @SubscribeMessage('rightPlayerMove')
  handleRightPlayerMove(
    @MessageBody() body: any,
    @ConnectedSocket() client: any,
  ) {
    // this.gameService.throttledPlayerMove(this.server, body, client, 'right');
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() body: any, @ConnectedSocket() client: any) {
    // this.gameService.gameLoop(this.server, body, client);
  }

  @SubscribeMessage('canvasOffsetTop')
  handleCanvasOffsetTop(@MessageBody() body: number) {
    // this.gameService.setCanvasOffsetTop(body);
  }
}
