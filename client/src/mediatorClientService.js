
var socket;

export default class MediatorClient {

  login(player, password, onLoginOK, onPlayersAdd, onPlayersRemove, onError) {

    socket = new WebSocket("ws://localhost:3016/ws");
    socket.onopen = event => {
        console.log("Connected to", event.currentTarget.url);

        var str = JSON.stringify({
          what: 'ASK_LOGIN',
          players: [player],
          password: password
        });
        socket.send(str);
    };
    socket.onclose = event => {
        console.log("Disconnected");
    };
    socket.onerror = event => {
        console.log("Socket error", event);
        onError(event);
    };
    socket.onmessage = event => {
      var msg = JSON.parse(event.data);
      switch( msg.what ) {
        case "LOGIN_OK":
          onLoginOK(player);
          break;
        case "LOGIN_ERROR":
          onError(msg.errorText);
          socket = null;
          break;
        case "PLAYERS_ADD":
          onPlayersAdd(msg.players);
          break;
        case "PLAYERS_REMOVE":
          onPlayersRemove(msg.players);
          break;
        default:
          console.log("WARNING unknown message: ", msg, "ignored");
      }
    };
  }

  logout(player) {
    var str = JSON.stringify({
      what: 'ASK_LOGOUT',
      players: [player],
      password: null
    });
    socket.send(str);
    socket = null;
  }

  retrieveWaitingPlayers(player) {
    var str = JSON.stringify({
      what: 'ASK_PLAYERS',
      players: [player],
      password: null
    });
    socket.send(str);
  }

}
