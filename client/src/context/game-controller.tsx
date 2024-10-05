import useUser from "./user-provider";

export default function GameController(){
    const {user} = useUser();
    

    function joinGame(){
        if (!user) return false;


    }
    

    return {joinGame}
}
