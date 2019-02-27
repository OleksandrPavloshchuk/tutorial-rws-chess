import Configuration from "./config";

const socketErrorText = "Can't connect to server";

export default (dispatch, player) => {
    const socket = new WebSocket(new Configuration().webSocketUrl);
    
    const sendAction = v => socket.send(JSON.stringify(v));
    
    socket.onopen = event => {
        console.log("Connected to", event.currentTarget.url);
        sendAction({type:"ASK_LOGIN", payload:{from:player}});
    };
    socket.onerror = event => dispatch({type:"LOGIN_ERROR",payload:{text:socketErrorText}});
    socket.onmessage = event => {
        // console.log('RECEIVED', event.data)
        dispatch(JSON.parse(event.data));
    };
    return socket;
}

/*
   logout = player => {
        this.sendGameMessage({type:"LOGOUT", payload:{from:player}});
        closeSocket();
    };

    retrieveWaitingPlayers = () => this.sendGameMessage({type:"ASK_PLAYERS" });
    startGame = (player, other, white) => this.sendGameMessage({type:"GAME_START", payload:{from:player, to:other, white:white}});
*/    

