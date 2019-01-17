
const socketErrorText = "Can't connect to server";

var socket;

function sendMessage(what, player, password) {
  let v = {what: what, from: player};
  if( password ) {
    v.password = password;
  }
  socket.send(JSON.stringify(v));
}

export default class MediatorClient {

  login(player, password, onLoginOK, onPlayersAdd, onPlayersRemove, onGameStart, onError) {

    socket = new WebSocket("ws://localhost:3016/ws");

    socket.onopen = event => {
      console.log("Connected to", event.currentTarget.url);
      sendMessage("ASK_LOGIN", player, password);
    };
    socket.onclose = event => { console.log("Disconnected"); };
    socket.onerror = event => { onError(socketErrorText); };
    socket.onmessage = event => {

      console.log('on message', event.data)

      var msg = JSON.parse(event.data);
      switch( msg.what ) {
        case "LOGIN_OK": onLoginOK(player); break;
        case "LOGIN_ERROR": onError(msg.errorText); socket = null; break;
        case "PLAYERS_ADD": onPlayersAdd(msg.players); break;
        case "PLAYERS_REMOVE": onPlayersRemove(msg.players); break;
        case "GAME_START": onGameStart(msg.from, msg.white); break;
        // TODO:
        case "SURRENDER":
        case "DEUCE":
        case "MOVE":
        default: console.log("WARNING unknown message: ", msg, "ignored");
      }
    };
  }

  logout(player) {
    sendMessage( "ASK_LOGOUT", player );
    socket = undefined;
  }

  retrieveWaitingPlayers(player) {
    sendMessage( "ASK_PLAYERS", player );
  }

  startGame(player, other, white) {
    let v = {what: "GAME_START", from: player, to: other, white: white};
    console.log("start game", v);
    socket.send(JSON.stringify(v));
  }

}
