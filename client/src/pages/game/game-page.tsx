import React, { useState, useEffect, useRef } from "react";
import GameCanvas from "./game-canvas";
import { Fighter, Sprite } from "./gameClasses";
import { rectangularCollision } from "./gameUtils";
import useUser from "../../context/user-provider";
import { useNavigate } from "react-router-dom";

export interface FighterData {
  type: string;
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  lastKey: string;
  health: number;
}

const GameViewport = {
  WIDTH: 1000,
  HEIGHT: 800,
};

let lastFrameTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;
const updateInterval = 10;
let animId: number;
let intervalId: NodeJS.Timeout;

const GameRoom = () => {
  const [increment, setIncrement] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const timeRef = useRef<boolean>(false);
  const latestPlayerData = useRef<FighterData>({
    type: "",
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lastKey: "",
    health: 100,
  });
  const latestEnemyData = useRef<FighterData>({
    type: "",
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lastKey: "",
    health: 100,
  });

  const [socketLoaded, setSocketLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<string>("l");
  const currPlayer2 = useRef<string | null>(null);
  const currPlayer = useRef<string | null>(null);
  const isFirstPlayer = useRef<boolean | null>(null);
  const timerRef = useRef<boolean>(false);
  const resetRef = useRef<boolean>(false);
  let timerTimeRef = useRef<number | null>(null);
  const gameStateRef = useRef<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audio] = useState(new Audio("./Game Asset/background music 1.mp3"));
  let socket: WebSocket;
  const {user} = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate('/login');
    else{

      socket = new WebSocket("ws://localhost:3000/game");
  
  
      socket.addEventListener("open", (event) => {
        //  console.log(currPlayer)
        if (timerTimeRef.current != null)
          socket.send(
            JSON.stringify({ type: "time", lastFrameTime: timerTimeRef.current })
          );
  
        socket.send(JSON.stringify({ status: "open" }));
        setSocketLoaded(true);
      });
  
      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        // console.log(data);
  
        if (data.updatePlayer !== undefined) {
          timerRef.current = true;
          currPlayer2.current = data.updatePlayer;
        }
  
        if (data.name !== undefined) {
          if (data.name === "First Player") {
            timerRef.current = false;
            currPlayer.current = data.name;
            isFirstPlayer.current = true;
          } else if (data.name === "Second Player") {
            timerRef.current = true;
            socket.send(JSON.stringify({ updatePlayer: data.name }));
            currPlayer2.current = data.name;
            isFirstPlayer.current = false;
          }
        }
  
        if (data.type !== undefined) {
          if (data.type === "") setShouldRender(false);
          if (data.type === "Player 1") {
            const updatedPlayerData: FighterData = {
              type: data.type,
              position: { x: data.position.x, y: data.position.y },
              velocity: { x: data.velocity.x, y: data.velocity.y },
              lastKey: data.lastKey,
              health: data.health,
            };
  
            latestPlayerData.current = updatedPlayerData;
          }
        }
        if (data.type === "Player 2") {
          // console.log("WOW")
          const updatedEnemyData: FighterData = {
            type: data.type,
            position: { x: data.position.x, y: data.position.y },
            velocity: { x: data.velocity.x, y: data.velocity.y },
            lastKey: data.lastKey,
            health: data.health,
          };
          latestEnemyData.current = updatedEnemyData;
        }
  
        if (data.type === "time") {
          lastFrameTime = data.lastFrameTime;
        }
  
        if (data.type === "gameState") {
          gameStateRef.current = data.gameState;
        }
      });
  
      socket.addEventListener("close", (event) => {
        // console.log("Server connection closed:", event);
        setSocketLoaded(false);
      });
      socketRef.current = socket;
    }

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    const initializeGame = () => {
      // console.log("test");
      if (canvas) {
        const context = canvas.getContext("2d");
        canvas.width = GameViewport.WIDTH;
        canvas.height = GameViewport.HEIGHT;

        audio.play()
        audio.volume = .01

        // const background2 = new Sprite({
        //   position: { x: 0, y: 0 },
        //   imageSrc: "../Game Asset/background/bg2.png",
        // });

        const sendPlayerData = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(player.serialize("Player 1")));
          }
        };

        const sendEnemyData = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(enemy.serialize("Player 2")));
          }
        };
        // intervalId = setInterval(sendPlayerData, updateInterval);
        const healthBar = new Sprite({
          position: { x: -10, y: 0 },
          scale: 3.2,
          imageSrc: "../Game Asset/lifebar full.png",
        });

        const background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: "../Game Asset/background/background.png",
        });

        const winSprite = new Sprite({
          position: { x: canvas.width / 3, y: canvas.height / 3 },
          imageSrc: "../Game Asset/win.png",
          scale: 5,
        });

        const loseSprite = new Sprite({
          position: { x: canvas.width / 3, y: canvas.height / 3 },
          imageSrc: "../Game Asset/lose.png",
          scale: 5,
        });

        const drawSprite = new Sprite({
          position: { x: canvas.width / 3, y: canvas.height / 3 },
          imageSrc: "../Game Asset/draw.png",
          scale: 5,
        });

        let player = new Fighter({
          position: { x: 100, y: 100 },
          velocity: { x: 0, y: 0 },
          color: "red",
          framesMax: 6,
          imageSrc: "../Game Asset/animated/blast impulse/idle.png",
          scale: 1,
          offset: {
            x: 40,
            y: 100,
          },
          sprites: {
            idle: {
              imageSrc: "../Game Asset/animated/blast impulse/idle.png",
              framesMax: 6,
            },
            idlem: {
              imageSrc: "../Game Asset/animated/blast impulse/idlem.png",
              framesMax: 6,
            },
            jump: {
              imageSrc: "../Game Asset/animated/blast impulse/jump.png",
              framesMax: 1,
            },
            jumpm: {
              imageSrc: "../Game Asset/animated/blast impulse/jumpm.png",
              framesMax: 1,
            },
            fall: {
              imageSrc: "../Game Asset/animated/blast impulse/jump.png",
              framesMax: 1,
            },
            run: {
              imageSrc: "../Game Asset/animated/blast impulse/walk.png",
              framesMax: 3,
            },
            runm: {
              imageSrc: "../Game Asset/animated/blast impulse/runm.png",
              framesMax: 3,
            },
            attack1: {
              imageSrc: "../Game Asset/animated/blast impulse/kick.png",
              framesMax: 3,
            },
            attack1m: {
              imageSrc: "../Game Asset/animated/blast impulse/kickm.png",
              framesMax: 3,
            },
            attack2: {
              imageSrc: "../Game Asset/animated/blast impulse/low-kick.png",
              framesMax: 4,
            },
            attack2m: {
              imageSrc: "../Game Asset/animated/blast impulse/low-kickm.png",
              framesMax: 4,
            },
          },
          attackBox: {
            offset: {
              x: 130,
              y: 10,
            },
            width: 170,
            height: 40,
          },
        });

        let enemy = new Fighter({
          position: { x: 800, y: 100 },
          velocity: { x: 0, y: 0 },
          color: "red",
          imageSrc: "../Game Asset/animated/sword impulse/idle.png",
          framesMax: 6,
          scale: 1,
          offset: {
            x: 40,
            y: 50,
          },
          sprites: {
            idle: {
              imageSrc: "../Game Asset/animated/sword impulse/idle.png",
              framesMax: 6,
            },
            idlem: {
              imageSrc: "../Game Asset/animated/sword impulse/idlem.png",
              framesMax: 6,
            },
            jump: {
              imageSrc: "../Game Asset/animated/sword impulse/jump.png",
              framesMax: 6,
            },
            jumpm: {
              imageSrc: "../Game Asset/animated/sword impulse/jumpm.png",
              framesMax: 6,
            },
            attack1: {
              imageSrc: "../Game Asset/animated/sword impulse/kick.png",
              framesMax: 4,
            },
            attack1m: {
              imageSrc: "../Game Asset/animated/sword impulse/kickm.png",
              framesMax: 4,
            },
            run: {
              imageSrc: "../Game Asset/animated/sword impulse/walk.png",
              framesMax: 10,
            },
            runm: {
              imageSrc: "../Game Asset/animated/sword impulse/walkm.png",
              framesMax: 10,
            },
            attack2: {
              imageSrc: "../Game Asset/animated/sword impulse/low-kick.png",
              framesMax: 4,
            },
            attack2m: {
              imageSrc: "../Game Asset/animated/sword impulse/low-kickm.png",
              framesMax: 4,
            },
          },
          attackBox: {
            offset: {
              x: 170,
              y: 50,
            },
            width: 170,
            height: 50,
          },
        });

        const keys = {
          a: {
            pressed: false,
          },
          d: {
            pressed: false,
          },
          ArrowRight: {
            pressed: false,
          },
          ArrowLeft: {
            pressed: false,
          },
        };

        const draw = (timestamp: number) => {
          // console.log(currentPlayer)
          // console.log(playerData)
          // console.log(gameStateRef.current);
          player.mirror = player.position.x >= enemy.position.x;
          enemy.mirror = enemy.position.x >= player.position.x;

          // context!.clearRect(0, 0, canvas.width, canvas.height);

          if (context) {
            // console.log(latestPlayerData)
            if (latestPlayerData.current.type !== "") {
              // console.log("Changer")
              player.velocity = latestPlayerData.current.velocity;
              player.position = latestPlayerData.current.position;
              player.lastKey = latestPlayerData.current.lastKey;
              player.health = latestPlayerData.current.health;
            }
            // console.log(latestEnemyData.current)
            if (latestEnemyData.current.type !== "") {
              // console.log("Changing")
              enemy.velocity = latestEnemyData.current.velocity;
              enemy.position = latestEnemyData.current.position;
              enemy.lastKey = latestEnemyData.current.lastKey;
              enemy.health = latestEnemyData.current.health;
            }
            const deltaTime = timestamp - lastFrameTime;

            if (deltaTime > frameTime) {
              // window.requestAnimationFrame(draw);
              // context.fillStyle = "blue";
              context.clearRect(0, 0, canvas.width, canvas.height);

              // context.fillStyle = "rgba(255, 255, 255, 0.15)";
              // context.fillRect(0, 0, canvas.width, canvas.height);
              background.update(context);
              // hb1.update(context)

              // Health Bars
              // player
              context.fillStyle = "blue";
              context.fillRect(120, 50, 3.21 * player.health, 50);

              // enemy
              context.fillStyle = "green";
              context.fillRect(890, 50, -3.21 * enemy.health, 50);
              healthBar.update(context);

              // HITBOXES
              // context.fillStyle = "green";
              // context.fillRect(
              //   player.position.x,
              //   player.position.y,
              //   player.width,
              //   player.height
              // );

              // context.fillStyle = "green";
              // context.fillRect(
              //   enemy.position.x,
              //   enemy.position.y,
              //   enemy.width,
              //   enemy.height
              // );

              // ATTACK RANGE

              // context.fillStyle = "red";
              // context.fillRect(
              //   player.attackBox.position.x,
              //   player.attackBox.position.y,
              //   player.attackBox.width,
              //   player.attackBox.height
              // );

              // context.fillStyle = "red";
              // context.fillRect(
              //   enemy.attackBox.position.x,
              //   enemy.attackBox.position.y,
              //   enemy.attackBox.width,
              //   enemy.attackBox.height
              // );

              // context.fillStyle = "green";
              // context.fillRect(1050 / 2 - 40, 50, 80, 80);

              // console.log(timerRef.current)
              if (timerRef.current) {
                timerTimeRef.current = 0;

                timerRef.current = false;
                resetRef.current = true;
                socket.send(
                  JSON.stringify({
                    type: "time",
                    lastFrameTime: timerTimeRef.current,
                  })
                );
              }
              // console.log(resetRef.current)
              // console.log(resetRef.current)
              // console.log(timerTimeRef)
              if (resetRef.current && timerTimeRef.current != null) {
                // const fontSize = 24;
                // context.font = `${fontSize}px Arial`;
                // // console.log(lastFrameTime)
                // let textPadding = lastFrameTime/1000 < 10 ? 0 : lastFrameTime/1000 <= 100 ? 10 : 20;
                // // console.log(textPadding)
                // context.fillStyle = "white";
                // context.fillText(
                //   Math.floor(lastFrameTime / 1000).toLocaleString(),
                //   (1080 - textPadding) / 2 - 40,
                //   45  + 80 / 2,
                //   240
                //   );

                const fontSize = 24;
                context.font = `${fontSize}px Arial`;
                // console.log(lastFrameTime)

                let textPadding =
                  timerTimeRef.current / 1000 < 10
                    ? 0
                    : timerTimeRef.current / 1000 <= 100
                    ? 10
                    : 20;
                // console.log(textPadding)
                context.fillStyle = "white";
                context.fillText(
                  Math.floor(timerTimeRef.current / 1000).toLocaleString(),
                  (1080 - textPadding) / 2 - 40,
                  45 + 80 / 2,
                  240
                );

                timerTimeRef.current += deltaTime;
              }

              // console.log(currPlayer2.current)

              if (currPlayer2.current === "Second Player") {
                enemy.update(context);
              }

              player.update(context);

              // console.log(enemy.position.x)
              // console.log(enemy.velocity.x)
              // console.log(player.lastKey)
              // if (enemy.velocity.x > 0 || player.velocity.x < 0) {
              //   player.switchSprite("run");
              // } else {
              //   player.switchSprite("idle");
              // }

              // player.velocity.x = 0;
              // enemy.velocity.x = 0;

              // if (keys.a.pressed && player.lastKey === "a") {
              //   player.velocity.x = -10;
              //   player.switchSprite("run");
              // } else if (keys.d.pressed && player.lastKey === "d") {
              //   player.velocity.x = 10;
              //   player.switchSprite("run");
              // } else {
              //   player.switchSprite("idle");
              // }
              // console.log(player.velocity.x);
              // if (player.velocity.x > 0) {
              //   player.switchSprite("run");
              // }
              if (player.velocity.x > 0 || player.velocity.x < 0) {
                player.switchSprite("run");
              } else {
                player.switchSprite("idle");
              }

              // jumping
              if (player.velocity.y < 0) {
                player.switchSprite("jump");
              } else if (player.velocity.y > 0) {
                // player.switchSprite('fall')
              }
              // console.log(enemy.lastKey);
              // console.log(player.lastKey);
              if (player.lastKey === "q") {
                player.switchSprite("attack2");
                player.lastKey = "";
              }
              if (player.lastKey === "e") {
                player.switchSprite("attack1");
                player.lastKey = "";
              }

              if (enemy.velocity.x > 0 || enemy.velocity.x < 0) {
                enemy.switchSprite("run");
              } else {
                enemy.switchSprite("idle");
              }

              // jumping
              if (enemy.velocity.y < 0) {
                enemy.switchSprite("jump");
              }

              if (enemy.lastKey === "e") {
                // console.log(enemy.lastKey);

                enemy.switchSprite("attack1");
                // console.log(enemy.lastKey)
                enemy.lastKey = "";
              }

              if (enemy.lastKey === "q") {
                // console.log(enemy.lastKey);

                enemy.switchSprite("attack2");
                // console.log(enemy.lastKey)
                enemy.lastKey = "";
              }

              // // detect for collision & enemy gets hit
              // if (
              //   rectangularCollision({
              //     rectangle1: player,
              //     rectangle2: enemy,
              //   }) &&
              //   player.isAttacking &&
              //   player.framesCurrent === 4
              // ) {
              //   console.log("HIT")
              //   enemy.takeHit();
              //   player.isAttacking = false;

              // gsap.to("#enemyHealth", {
              //   width: enemy.health + "%",
              // });
              // }

              // if player misses
              if (player.isAttacking && player.framesCurrent === 4) {
                player.isAttacking = false;
              }

              // this is where our player gets hit

              // if player misses
              if (enemy.isAttacking && enemy.framesCurrent === 2) {
                enemy.isAttacking = false;
              }

              // end game based on health
              if (enemy.health <= 0 || player.health <= 0) {
                // determineWinner({ player, enemy, timerId })
              }
            }
            lastFrameTime = timestamp - (deltaTime % frameTime);

            //   socket.send(JSON.stringify(player.serialize('Player 1')));
            // console.log(gameStateRef)
            //
            // console.log(deltaTime)

            if (
              gameStateRef.current === "Player 1 Win" &&
              isFirstPlayer != null &&
              isFirstPlayer.current === true
            ) {
              winSprite.update(context);
            }
            if (
              gameStateRef.current === "Player 1 Win" &&
              isFirstPlayer != null &&
              isFirstPlayer.current === false
            ) {
              loseSprite.update(context);
            }

            if (
              gameStateRef.current === "Player 2 Win" &&
              isFirstPlayer != null &&
              isFirstPlayer.current === false
            ) {
              winSprite.update(context);
            }
            if (
              gameStateRef.current === "Player 2 Win" &&
              isFirstPlayer != null &&
              isFirstPlayer.current === true
            ) {
              loseSprite.update(context);
            }

            if (enemy.health <= 0) {
              socket.send(
                JSON.stringify({ type: "gameState", gameState: "Player 1 Win" })
              );
            }
            if (player.health <= 0) {
              socket.send(
                JSON.stringify({ type: "gameState", gameState: "Player 2 Win" })
              );
            }
            // console.log(timerTimeRef.current);
            if (
              timerTimeRef.current != null &&
              timerTimeRef.current > 60 * 1000 &&
              enemy.health > 0 &&
              player.health > 0
            ) {
              socket.send(
                JSON.stringify({ type: "gameState", gameState: "DRAW" })
              );
            }
            if (gameStateRef.current === "DRAW") {
              drawSprite.update(context);
            } else if (enemy.health >= 0 && player.health >= 0) {
              socket.send(
                JSON.stringify({ type: "gameState", gameState: "NONE" })
              );
            }

            requestAnimationFrame(draw);
          }
        };

        animId = requestAnimationFrame(draw);

        window.addEventListener("keypress", (event) => {
          if (!player.dead && isFirstPlayer.current === true) {
            switch (event.key) {
              case "e":
                player.switchSprite("attack1");
                console.log(
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                );
                if (
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                ) {
                  player.lastKey = "e";
                  // player.attack();
                  enemy.takeHit(10);
                }
                break;
              case "q":
                player.switchSprite("attack2");
                console.log(
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                );
                if (
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                ) {
                  player.lastKey = "q";
                  // player.attack();
                  enemy.takeHit(15);
                }
                break;
            }
            sendEnemyData();
            sendPlayerData();
          }
          if (
            !enemy.dead &&
            isFirstPlayer.current === false &&
            gameStateRef.current === "NONE"
          ) {
            switch (event.key) {
              case "e":
                enemy.switchSprite("attack1");
                console.log(
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                );
                if (
                  rectangularCollision({
                    rectangle1: enemy,
                    rectangle2: player,
                  })
                ) {
                  // enemy.lastKey = "";
                  // enemy.attack();
                  player.takeHit(10);
                }
                break;
              case "q":
                enemy.switchSprite("attack2");
                console.log(
                  rectangularCollision({
                    rectangle1: player,
                    rectangle2: enemy,
                  })
                );
                if (
                  rectangularCollision({
                    rectangle1: enemy,
                    rectangle2: player,
                  })
                ) {
                  // enemy.lastKey = "";
                  // enemy.attack();
                  player.takeHit(15);
                }
                break;
            }
            sendEnemyData();
            sendPlayerData();
          }
        });

        window.addEventListener("keydown", (event) => {
          if (
            !player.dead &&
            isFirstPlayer.current === true &&
            gameStateRef.current === "NONE"
          ) {
            // console.log(currPlayer.current)
            switch (event.key) {
              case "d":
                keys.d.pressed = true;
                player.lastKey = "d";
                player.velocity.x = 10;
                break;
              case "a":
                keys.a.pressed = true;
                player.lastKey = "a";
                player.velocity.x = -10;
                break;
              case "w":
                player.velocity.y = -12;
                break;
              case "e":
                player.lastKey = "e";
                player.attack();
                break;
              case "q":
                player.lastKey = "q";
                player.attack2();
                break;
              default:
                player.velocity.x = 0;
                player.velocity.y = 0;
                break;
            }
            sendPlayerData();
          }

          if (
            !enemy.dead &&
            isFirstPlayer.current === false &&
            gameStateRef.current === "NONE"
          ) {
            // console.log('woi')
            switch (event.key) {
              case "d":
                keys.d.pressed = true;
                enemy.lastKey = "d";
                enemy.velocity.x = 10;
                break;
              case "a":
                keys.a.pressed = true;
                enemy.lastKey = "a";
                enemy.velocity.x = -10;
                break;
              case "w":
                enemy.velocity.y = -12;
                break;
              case "e":
                enemy.lastKey = "e";
                enemy.attack();
                break;
              case "q":
                enemy.lastKey = "q";
                enemy.attack2();
                break;
              default:
                enemy.velocity.x = 0;
                enemy.velocity.y = 0;
                break;
            }
            sendEnemyData();
          }
        });

        window.addEventListener("keyup", (event) => {
          if (event.key && gameStateRef.current === "NONE") {
            if (isFirstPlayer.current === true) {
              player.velocity.x = 0;
              if (event.key === "d") keys.d.pressed = false;
              if (event.key === "a") keys.a.pressed = false;
              if (event.key === "e") player.lastKey = "";
              if (event.key === "q") player.lastKey = "";
              sendPlayerData();
            } else {
              enemy.velocity.x = 0;
              if (event.key === "d") keys.d.pressed = false;
              if (event.key === "a") keys.a.pressed = false;
              if (event.key === "e") enemy.lastKey = "";
              if (event.key === "q") enemy.lastKey = "";
              sendEnemyData();
            }
          }
        });
      }
    };
    const delay = 500;
    const timeoutId = setTimeout(initializeGame, delay);

    return () => {
      clearTimeout(timeoutId);
      audio.pause();
      window.location.reload();
    };
  }, []);

  const handleIncrement = () => {
    const currentSocket = socketRef.current;

    if (currentSocket) {
      const newIncrement = increment + 1;
      setIncrement(newIncrement);

      const message = newIncrement.toString();
      currentSocket.send(message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "inherit",
        marginTop: "5%",
      }}
    >
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
};

export default GameRoom;
