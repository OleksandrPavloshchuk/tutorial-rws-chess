
const socketErrorText = "Can't connect to server";

var socket;

function sendContent(v) {
  socket.send(JSON.stringify(v));
}

function sendMessage(what, sender, password) {
  let v = {what: what};
  if( sender ) {
    v.from = sender;
  }
  if( password ) {
    v.password = password;
  }
  sendContent(v);
}

export default class MediatorClient {

  startSession(player, password, onLoginOK, onPlayersAdd, onPlayersRemove, onGameStart, onMove, onAskGameEnd, onGameEnd, onError) {

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
        case "LOGIN_ERROR": onError(msg.text); socket = null; break;
        case "PLAYERS_ADD": onPlayersAdd(msg.players); break;
        case "PLAYERS_REMOVE": onPlayersRemove(msg.players); break;
        case "GAME_START": onGameStart(msg.from, msg.white); break;
        case "ASK_SURRENDER": onAskGameEnd("SURRENDER", "Accept surrender ?", "You win" ); break;
        case "ASK_DEUCE": onAskGameEnd("DEUCE", "Accept deuce ?", "Deuce" ); break;
        case "SURRENDER": onGameEnd("You lose" ); break;
        case "DEUCE": onGameEnd("Deuce" ); break;
        case "MOVE": onMove(msg.move, msg.text); break;
        default: console.log("WARNING unknown message: ", msg, "ignored");
      }
    };
  }

  logout(player) {
    sendMessage( "LOGOUT", player );
    socket = undefined;
  }

  retrieveWaitingPlayers() {
    sendMessage( "ASK_PLAYERS" );
  }

  startGame(player, other, white) {
    sendContent({what: "GAME_START", from: player, to: other, white: white});
  }

  sendGameMessage(player, other, what, move ) {
    let v = {what: what, from: player, to: other};
    if( move ) {
      v.move = move;
    }
    sendContent(v);
  }

}
