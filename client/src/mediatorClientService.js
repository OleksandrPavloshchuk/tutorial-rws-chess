
const socketErrorText = "Can't connect to server";

var socket;

function sendMessage(what, player, password) {
  var v = {what: what, from: player};
  if( password ) {
    v.password = password;
  }
  socket.send(JSON.stringify(v));
}

export default class MediatorClient {

  login(player, password, onLoginOK, onPlayersAdd, onPlayersRemove, onError) {

    socket = new WebSocket("ws://localhost:3016/ws");

    socket.onopen = event => {
      console.log("Connected to", event.currentTarget.url);
      sendMessage("ASK_LOGIN", player, password);
    };
    socket.onclose = event => { console.log("Disconnected"); };
    socket.onerror = event => { onError(socketErrorText); };
    socket.onmessage = event => {
      var msg = JSON.parse(event.data);
      switch( msg.what ) {
        case "LOGIN_OK": onLoginOK(player); break;
        case "LOGIN_ERROR": onError(msg.errorText); socket = null; break;
        case "PLAYERS_ADD": onPlayersAdd(msg.players); break;
        case "PLAYERS_REMOVE": onPlayersRemove(msg.players); break;
        // TODO:
        case "GAME_START":
        case "SURRENDER":
        case "DEUCE":
        case "MOVE":
        default: console.log("WARNING unknown message: ", msg, "ignored");
      }
    };
  }

  logout(player) {
    sendMessage( "ASK_LOGOUT", player );
    socket = null;
  }

  retrieveWaitingPlayers(player) {
    sendMessage( "ASK_PLAYERS", player );
  }

}
