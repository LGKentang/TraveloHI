import React, { useEffect, useRef, useState } from "react";
import "../../styles/game/GameRoom.scss";
import "../../styles/game/GameCanvas.scss";
import { Fighter, Sprite } from "./gameClasses";
import { rectangularCollision } from "./gameUtils";
import { FighterData } from "./game-page";
// import "../../../public/Game Asset/sword impulse/idle/sword-impulse_01.png"

interface ISocket {
  socket: WebSocket;
  playerData : FighterData | null; 
}

const GameViewport = {
  WIDTH: 1000,
  HEIGHT: 800,
};

let lastFrameTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;
const updateInterval = 10;
const GameCanvas: React.FC<ISocket> = ({socket, playerData}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audio] = useState(new Audio("./Game Asset/background music 1.mp3"));
  


  const [canvasReady, setCanvasReady] = useState(false);
     const latestPlayerData = useRef<FighterData>({
        type: "",
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        lastKey: "",
        health: 100,
      });

     
        // console.log(playerData);
        let player = new Fighter({
          position: { x: 400, y: 100 },
          velocity: { x: 0, y: 0 },
          color: "red",
          framesMax: 6,
          imageSrc: "../Game Asset/animated/blast impulse/idle.png",
          scale: 1,
          offset: {
            x: 215,
            y: 167,
          },
          sprites: {
            idle: {
              imageSrc: "../Game Asset/animated/blast impulse/idle.png",
              framesMax: 6,
            },
            jump: {
              imageSrc: "../Game Asset/animated/blast impulse/jump.png",
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
            attack1: {
              imageSrc: "../Game Asset/animated/blast impulse/kick11.png",
              framesMax: 9.5,
            },
          },
          attackBox: {
            offset: {
              x: -170,
              y: 50,
            },
            width: 170,
            height: 50,
          },
        });   
        const sendPlayerData = () => {
          if (socket) {
            socket.send(JSON.stringify(player.serialize('Player 1')));
          }
        };
  let animId: number;
  let intervalId: NodeJS.Timeout;

  useEffect(() => {
    const canvas = canvasRef.current;
    

    if (canvas) {
      const context = canvas.getContext("2d");
      canvas.width = GameViewport.WIDTH;
      canvas.height = GameViewport.HEIGHT;
      // const background2 = new Sprite({
      //   position: { x: 0, y: 0 },
      //   imageSrc: "../Game Asset/background/bg2.png",
      // });

     
      // intervalId = setInterval(sendPlayerData, updateInterval);
      const background = new Sprite({
        position: { x: 0, y: 0 },
        imageSrc: "../Game Asset/background/background.png",
      });
      
      

      const enemy = new Fighter({
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: 0 },
        color: "red",
        imageSrc: "../Game Asset/animated/blast impulse/idle.png",
        scale: 1,
        offset: {
          x: 0,
          y: 0,
        },
        sprites: {
          idle: {
            imageSrc: "../Game Asset/animated/blast impulse/idle.png",
            framesMax: 5,
          },
        },
        attackBox: {
          offset: {
            x: -170,
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
        // console.log(playerData)
        if (context) {
          // if (playerData != null){
          //   player.velocity = playerData.velocity
          //   player.position = playerData.position
          // }
          const deltaTime = timestamp - lastFrameTime;
          
          if (deltaTime > frameTime) {
            window.requestAnimationFrame(draw);
            
            background.update(context);
            context.fillStyle = "blue";
            context.fillStyle = "rgba(255, 255, 255, 0.15)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            // enemy.update(context);
            player.update(context);

            player.velocity.x = 0;
            enemy.velocity.x = 0;

            if (keys.a.pressed && player.lastKey === "a") {
              player.velocity.x = -10;
              player.switchSprite("run");
            } else if (keys.d.pressed && player.lastKey === "d") {
              player.velocity.x = 10;

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

            // Enemy movement
            // if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
            //   enemy.velocity.x = -5;
            //   // enemy.switchSprite('run')
            // } else if (
            //   keys.ArrowRight.pressed &&
            //   enemy.lastKey === "ArrowRight"
            // ) {
            //   enemy.velocity.x = 5;
            //   // enemy.switchSprite('run')
            // } else {
            //   // enemy.switchSprite('idle')
            // }

            // detect for collision & enemy gets hit
            if (
              rectangularCollision({
                rectangle1: player,
                rectangle2: enemy,
              }) &&
              player.isAttacking &&
              player.framesCurrent === 4
            ) {
              // enemy.takeHit();
              player.isAttacking = false;

              // gsap.to("#enemyHealth", {
              //   width: enemy.health + "%",
              // });
            }

            // if player misses
            if (player.isAttacking && player.framesCurrent === 4) {
              player.isAttacking = false;
            }

            // this is where our player gets hit
            if (
              rectangularCollision({
                rectangle1: enemy,
                rectangle2: player,
              }) &&
              enemy.isAttacking &&
              enemy.framesCurrent === 2
            ) {
              // player.takeHit();
              // enemy.isAttacking = false;
              // gsap.to('#playerHealth', {
              // width: player.health + '%'
              // })
            }

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

          // socket.send(JSON.stringify(player.serialize('Player 1')));
          requestAnimationFrame(draw);
        }
      };

     animId = requestAnimationFrame(draw);
     setCanvasReady(true);
      window.addEventListener("keydown", (event) => {
        if (!player.dead) {
          switch (event.key) {
            case "d":
              keys.d.pressed = true;
              player.lastKey = "d";
              break;
            case "a":
              keys.a.pressed = true;
              player.lastKey = "a";
              break;
            case "w":
              player.velocity.y = -12;
              break;
            case "e":
              player.attack();
              socket.send(JSON.stringify(player.serialize('Player 1')));
              break;
          }
        }

        if (!enemy.dead) {
          switch (event.key) {
            case "ArrowRight":
              keys.ArrowRight.pressed = true;
              enemy.lastKey = "ArrowRight";
              sendPlayerData()
              break;
            case "ArrowLeft":
              keys.ArrowLeft.pressed = true;
              enemy.lastKey = "ArrowLeft";
              sendPlayerData()
              break;
            case "ArrowUp":
              enemy.velocity.y = -20;
              break;
            case "ArrowDown":
              enemy.attack();

              break;
          }
        }
      });

      window.addEventListener("keyup", (event) => {
        switch (event.key) {
          case "d":
            keys.d.pressed = false;
            break;
          case "a":
            keys.a.pressed = false;
            break;
        }

        // enemy keys
        switch (event.key) {
          case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
          case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
        }
      });
    }

    return () => {
       clearInterval(intervalId);
       cancelAnimationFrame(animId)
       audio.pause();
      window.location.reload();
    };
  
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
      <img
        className="game-object"
        src="/Game Asset/sword impulse/idle/sword-impulse_01.png"
        alt=""
      />
    </div>
  );
};

export default GameCanvas;

// const handleKeyDown = (event: KeyboardEvent) => {
//   if (socket) {
//     switch (event.key) {
//       case "w":
//         positionRef.current.y -= 5;
//         break;
//       case "a":
//         positionRef.current.x -= 5;
//         break;
//       case "s":
//         positionRef.current.y += 5;
//         break;
//       case "d":
//         positionRef.current.x += 5;
//         break;
//       default:
//         break;
//     }
//     const message = JSON.stringify({
//       x: positionRef.current.x,
//       y: positionRef.current.y,
//     });
//     socket.send(message);
//   }
// };

// window.addEventListener("keydown", handleKeyDown);

// return () => {
// window.removeEventListener("keydown", handleKeyDown);
// };
