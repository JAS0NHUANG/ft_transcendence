import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

import PageContainer from "../components/styles/PageContainer.styled";

// Connect to the socket from outside of the component
// avoid reconnection when ever the states changed
const access_token: string = Cookies.get("jwt")!;
const socket: Socket = io("http://localhost:3000", {
  extraHeaders: {
    Authorization: access_token,
  },
});
socket.connect();

interface Position {
  x: number;
  y: number;
}

const Pong = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWidth = 800;
  const canvasHeight = 400;

  const paddleHeight = 75;
  const paddleWidth = 10;
  const paddleX = 40;
  const [leftPaddleY, setLeftPaddleY] = useState<number>(
    canvasHeight / 2 - paddleHeight / 2,
  );
  const [rightPaddleY, setRightPaddleY] = useState<number>(
    canvasHeight / 2 - paddleHeight / 2,
  );
  const [ball, setBall] = useState<Position>({ x: 0, y: 0 });
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(3);
  const [score, setScore] = useState<Record<number, number>>({ 0: 0, 1: 0 });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected: ", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("disconnected: ", socket?.id);
    });

    socket.on("error", (error: string) => {
      console.log("Websocket connection error: ", error);
    });

    socket.on("updateLeftPaddle", (newPosition: string) => {
      setLeftPaddleY(parseInt(newPosition));
    });

    socket.on("updateRightPaddle", (newPosition: string) => {
      setRightPaddleY(parseInt(newPosition));
    });

    socket.on("updateBall", (newPosition: Position) => {
      setBall(newPosition);
    });

    socket.on("updateGame", (gameData: any) => {
      setBall(gameData.ballPosition);
      setScore({ 0: gameData.score[0], 1: gameData.score[1] });
    });

    socket.on("updateScore", (newScore: Record<number, number>) => {
      setScore(newScore);
    });

    // still testing
    socket.on("gameRunning", (gameState: Object) => {
      console.log(gameState);
    });

    console.log(isWaiting, countdown);
    if (!isWaiting && countdown < 1) {
      console.log("game start!");
      socket.emit("startGame");
    }

    socket.on("endWaitingState", () => {
      setIsWaiting(false);
      const interval = setInterval(() => {
        setCountdown((prevCountdown: number) => {
          if (prevCountdown <= 1) {
            clearInterval(interval);
            return 0;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
    });

    socket.emit("setCanvas", {
      canvasHeight,
      canvasWidth,
      paddleHeight,
      paddleWidth,
      paddleX,
    });

    return () => {
      socket?.off("error");
      socket?.off("updatePaddlePosition");
      socket?.off("updateBallPosition");
    };
  }, [isWaiting, countdown]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (!isWaiting) {
        if (event.key === "ArrowUp") {
          socket?.emit("movePaddle", "up");
        } else if (event.key === "ArrowDown") {
          socket?.emit("movePaddle", "down");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWaiting]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (isLanding) {
        if (event.key === "Enter") {
          console.log("enter pressed");
          socket?.emit("playGame");
          setIsLanding(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLanding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // make background canvas black
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // draw a white border
        context.strokeStyle = "white";
        context.lineWidth = 3;
        context.setLineDash([]);
        context.strokeRect(0, 0, canvas.width, canvas.height);

        // draw the dashed divider line
        context.setLineDash([30, 15]);
        context.beginPath();
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.stroke();

        // draw both paddles
        context.fillStyle = "white";
        context.fillRect(paddleX, leftPaddleY, paddleWidth, paddleHeight);
        context.fillRect(
          canvasWidth - paddleWidth - paddleX,
          rightPaddleY,
          paddleWidth,
          paddleHeight,
        );

        // draw the ball
        if (!isWaiting && countdown < 1) {
          context.fillStyle = "white";
          context.fillRect(
            ball.x - paddleWidth / 2,
            ball.y / 2 - paddleWidth / 2,
            paddleWidth,
            paddleWidth,
          );
        }

        // add score
        context.font = "60px 'JetBrains Mono', monospace";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(score[0].toString(), canvas.width * 0.25, 20);
        context.fillText(score[1].toString(), canvas.width * 0.75, 20);
      }

      if (context && isLanding) {
        context.font = "30px 'JetBrains Mono', monospace";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          "Press Enter to start a game.",
          canvas.width / 2,
          canvas.height / 2,
        );
      } else if (context && isWaiting) {
        context.font = "30px 'JetBrains Mono', monospace";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          "Waiting for another player...",
          canvas.width / 2,
          canvas.height / 2,
        );
      } else if (context && countdown > 0) {
        context.font = "90px 'JetBrains Mono', monospace";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          countdown.toString(),
          canvas.width / 2,
          canvas.height / 2,
        );
      }
    }
  }, [leftPaddleY, rightPaddleY, ball, isWaiting, isLanding, countdown, score]);

  return (
    <PageContainer>
      <h1>Pong</h1>
      <canvas ref={canvasRef} />
      <p>Use the arrow keys to play the game</p>
    </PageContainer>
  );
};

export default Pong;
