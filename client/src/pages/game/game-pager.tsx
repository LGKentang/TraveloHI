// import React, { useState, useEffect, useRef } from 'react';
// import GameCanvas from './game-canvas';
// import { Fighter } from './gameClasses';

// export interface FighterData {
//     type : string
//     position: {
//         x: number;
//         y: number;
//     };
//     velocity: {
//         x: number;
//         y: number;
//     };
//     lastKey : string;
//     health : number;
// }

// const GameRoom = () => {
//     const [increment, setIncrement] = useState(0);
//     const socketRef = useRef<WebSocket | null>(null);
//     const latestPlayerData = useRef<FighterData>({
//         type: "",
//         position: { x: 0, y: 0 },
//         velocity: { x: 0, y: 0 },
//         lastKey: "",
//         health: 100,
//       });
//     const [socketLoaded, setSocketLoaded] = useState(false);
//     const [shouldRender, setShouldRender] = useState(true);

//     useEffect(() => {
//         const newSocket = new WebSocket('ws://localhost:3000/game');
        
//         newSocket.addEventListener('open', (event) => {
//             newSocket.send(JSON.stringify({status :  'open'}));
//             setSocketLoaded(true);
//         });
        
//         newSocket.addEventListener("message", (event) => {
//             const data = JSON.parse(event.data);
//             // console.log(data)
//             if (data.type !== undefined) {
//                 if (data.type === '') setShouldRender(false)
//                 else{
//                     const updatedPlayerData: FighterData = {
//                       type: data.type,
//                       position: { x: data.position.x, y: data.position.y },
//                       velocity: { x: data.velocity.x, y: data.velocity.y },
//                       lastKey: data.lastKey,
//                       health: data.health,
//                     };
            
//                     latestPlayerData.current = updatedPlayerData;
//                   }
//             }
//           });
        
//         newSocket.addEventListener('close', (event) => {
//             console.log('Server connection closed:', event);
//             setSocketLoaded(false)
//         });
//         socketRef.current = newSocket;
        
//         return () => {
//             newSocket.close();
//         };
//     }, []);

//     const handleIncrement = () => {
//         const currentSocket = socketRef.current;

//         if (currentSocket) {
//             const newIncrement = increment + 1;
//             setIncrement(newIncrement);

//             const message = newIncrement.toString();
//             currentSocket.send(message);
//         }
//     };



//     return (
//         <div style={{display:'flex', alignItems:'center',justifyContent:'center', width:'inherit', marginTop:'5%'}}>
//            {shouldRender && socketRef.current && <GameCanvas socket={socketRef.current} playerData = {latestPlayerData.current}
//            ></GameCanvas>}
//             {/* <p>Increment: {increment}</p> 
//             <button onClick={handleIncrement}>Increment</button> */}
            
//         </div>
//     )
// };

// export default GameRoom;