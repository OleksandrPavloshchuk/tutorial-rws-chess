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
      removePlayer(name)
    }
  }
}

func DispatchMessage(msg *Message, connection *websocket.Conn) (*Message, bool) {
  switch msg.What {
  case "ASK_LOGIN":
    err := login(msg.Players[0], msg.Password, connection)
    res := Message{What:"LOGIN_OK"}
    if err!=nil {
      res.What = "LOGIN_ERROR"
      res.ErrorText = err.Error()
    }
    return &res, false
  case "ASK_LOGOUT":
    name := msg.Players[0]
    log.Printf("Player %v is log out\n", name)
    removePlayer(name)
    return nil, true
  case "ASK_PLAYERS":
    res := Message{What: "PLAYERS_ADD", Players: retrievePlayers(msg.Players[0])}
    return &res, false
  case "GAME_START":
    changePlayersMode(msg, "PLAYERS_REMOVE", playing)
    return nil, false
  case "MOVE":
  case "ASK_SURRENDER":
  case "ASK_DEUCE":
    sendGameRelatedMessage(msg, connection)
    return nil, false
  case "SURRENDER":
  case "DEUCE":
    changePlayersMode(msg, "PLAYERS_ADD", waiting)
    return nil, false
  default:
    log.Println("DISPATCH: unexpected message: %v\n", msg)
    return nil, false
  }
  return nil, false
}

func changePlayersMode(msg *Message, what string, mode int) {
  for _,p := range msg.Players {
    s, found := activePlayers[p]
    if found {
      s.mode = mode
      activePlayers[p] = s
    }
    sendMessageToClients(what, p)
  }
}

func sendGameRelatedMessage(msg *Message, connection *websocket.Conn) {
  p := msg.Players[0]
  session,found := activePlayers[p]
  if !found {
    // Probably this player is already gone
    sendMessageToClients("PLAYERS_REMOVE", p)
  } else if session.mode==playing {
    content, _ := json.Marshal(msg)
    session.connection.WriteMessage(websocket.TextMessage, content)
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

func removePlayer(name string) {
  session, found := activePlayers[name]
  if found {
    session.connection.Close()
    sendMessageToClients("PLAYERS_REMOVE", name)
    delete(activePlayers, name)
  }
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
