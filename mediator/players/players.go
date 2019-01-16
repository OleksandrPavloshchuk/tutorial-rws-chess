package players

import (
  "net"
  "log"
  "errors"
  "encoding/json"
  "github.com/gorilla/websocket"
)

const (
  waiting = iota
  playing = iota
)

type Message struct {
  What string `json:"what"`
  Players []string `json:"players"`
  Password string `json:"password"`
  ErrorText string `json:"errorText"`
  Move string `json:"move"`
}

// TODO (2019/01/14) check credentials from database
var passwords map[string]string

type playerSession struct {
  name string
  connection *websocket.Conn
  mode int
}

var activePlayers map[string]playerSession

func Init() {
  activePlayers = make(map[string]playerSession, 0)
  passwords = make(map[string]string, 3)
  passwords["player-1"]="123456"
  passwords["player-2"]="654321"
  passwords["me"]="1"
}

func sendMessageToClients(what string, player string) {
  msg := Message{ What: what, Players: []string{player}}
  content, _ := json.Marshal(msg)
  for name, session := range activePlayers {
    if name != player {
      session.connection.WriteMessage(websocket.TextMessage, content)
    }
  }
}

func RemovePlayer(addr net.Addr) {
  // Find player:
  for name,session := range activePlayers {
    if session.connection.RemoteAddr()==addr {
      log.Printf("Connection to player %v is lost\n", name)
      logout(name)
      sendMessageToClients("PLAYERS_REMOVE", name)
    }
  }
}

func DispatchMessage(msg Message, connection *websocket.Conn) (Message, error) {
  switch msg.What {
  case "ASK_LOGIN":
    err := login(msg.Players[0], msg.Password, connection)
    if err!=nil {
      return Message{ What: "LOGIN_ERROR", ErrorText: err.Error() }, nil
    } else {
      return Message{ What: "LOGIN_OK" }, nil
    }
  case "ASK_LOGOUT":
    logout(msg.Players[0])
    return Message{ What: "LOGOUT" },nil
  case "ASK_PLAYERS":
    players := retrievePlayers(msg.Players[0])
    return Message{What: "PLAYERS_ADD", Players: players}, nil
  case "GAME_START":
    for _,p := range msg.Players {
      s, found := activePlayers[p]
      if found {
        s.mode = playing
        activePlayers[p] = s
      }
      sendMessageToClients("PLAYERS_REMOVE", p)
    }
    return Message{ What: "NONE" },nil
  case "MOVE":
    p := msg.Players[0]
    session,found := activePlayers[p]
    if found {
      content, _ := json.Marshal(msg)
      session.connection.WriteMessage(websocket.TextMessage, content)
    } else {
      // Probably this player is already gone
      sendMessageToClients("PLAYERS_REMOVE", p)
    }
    return Message{ What: "NONE" },nil
    // TODO (2019/01/16) proposals to surrender or deuce
  default:
    log.Println("DISPATCH: unexpected message: %v\n", msg)
    return Message{}, errors.New("unexpected message")
  }
}

func login(name string, password string, connection *websocket.Conn) error {

  _,found := activePlayers[name]
  if found {
    return errors.New("This player is already logged in")
  }

  // Check the password and register
  foundPassword, found := passwords[name]

  if found && foundPassword==password {
      sendMessageToClients("PLAYERS_ADD", name)

      activePlayers[name] = playerSession{ name: name, connection: connection, mode: waiting }
      log.Printf("login: %v\n", name)

      return nil
  }

  return errors.New("Login failed")
}

func logout(name string) {
  sendMessageToClients("PLAYERS_REMOVE", name)
  delete(activePlayers, name)
  log.Printf("logout: %v\n", name)
}

func retrievePlayers(name string) []string {
  r := make([]string,0)
  for k, session := range activePlayers {
    if waiting == session.mode && name != k {
      r = append( r, k)
    }
  }
  return r
}
