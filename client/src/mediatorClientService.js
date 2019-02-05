import Configuration from "./config";

const socketErrorText = "Can't connect to server";

var socket;

var sendContent = v => socket.send(JSON.stringify(v));
var closeSocket = () => { socket.close(); socket = undefined; };

export default class MediatorClient {

    startSession(player, password, dispatcher) {  
        this.config = new Configuration();    
        socket = new WebSocket(this.config.webSocketUrl);

        socket.onopen = event => {
            console.log("Connected to", event.currentTarget.url);
            this.sendGameMessage({what:"ASK_LOGIN", from:player, password:password});
        };
        socket.onclose = event => console.log("Disconnected");
        socket.onerror = event => dispatcher["LOGIN_ERROR"]({text:socketErrorText});
        socket.onmessage = event => {

            console.log('RECEIVED', event.data)

            var msg = JSON.parse(event.data);
            if( "LOGIN_ERROR"===msg.what) { closeSocket(); }
            var msgHandler = dispatcher[msg.what];
            if( msgHandler ) {
                msgHandler(msg);
            } else {
                console.log("WARNING unknown message: ", msg, "ignored");
            }
        }
    }

    logout = player => {
        this.sendGameMessage({ what:"LOGOUT", from:player });
        closeSocket();
    };

    retrieveWaitingPlayers = () => this.sendGameMessage({what:"ASK_PLAYERS" });
    startGame = (player, other, white) => this.sendGameMessage({what:"GAME_START", from:player, to:other, white:white});
    sendGameMessage = v => sendContent(v);

}
