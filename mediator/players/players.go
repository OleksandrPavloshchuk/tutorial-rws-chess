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
  Sender string `json:from`
  Receiver string `json:to`
  Players []string `json:"players"`
  Password string `json:"password"`
  ErrorText string `json:"errorText"`
  Move string `json:"move"`
  White bool `json:"white"`
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

func RemovePlayer(addr net.Addr) {
  for name,session := range activePlayers {
    if session.connection.RemoteAddr()==addr {
      log.Printf("Connection to player %v is lost\n", name)
      removePlayer(name)
      return
    }
  }
}

func DispatchMessage(msg *Message, connection *websocket.Conn) (*Message, bool) {
  switch msg.What {
  case "ASK_LOGIN":
    err := login(msg.Sender, msg.Password, connection)
    res := Message{What:"LOGIN_OK"}
    if err!=nil {
      res.What = "LOGIN_ERROR"
      res.ErrorText = err.Error()
    }
    return &res, false
  case "ASK_LOGOUT":
    log.Printf("logout: %v\n", msg.Sender)
    removePlayer(msg.Sender)
    return nil, true
  case "ASK_PLAYERS":
    res := Message{What: "PLAYERS_ADD", Players: retrievePlayers(msg.Sender)}
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
  changePlayerMode(msg.Sender, what, mode)
  changePlayerMode(msg.Receiver, what, mode)
  content, _ := json.Marshal(msg)
  session := activePlayers[msg.Receiver]
  session.connection.WriteMessage(websocket.TextMessage, content)
}

func changePlayerMode(player string, what string, mode int) {
  s, found := activePlayers[player]
  if found {
    s.mode = mode
    activePlayers[player] = s
  }
  sendMessageToClients(what, player)
}

func sendGameRelatedMessage(msg *Message, connection *websocket.Conn) {
  session,found := activePlayers[msg.Receiver]
  if !found {
    // Probably this player is already gone
    sendMessageToClients("PLAYERS_REMOVE", msg.Receiver)
  } else if session.mode==playing {
    content, _ := json.Marshal(msg)
    session.connection.WriteMessage(websocket.TextMessage, content)
  }
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

func login(name string, password string, connection *websocket.Conn) error {

  if _,found := activePlayers[name]; found {
    return errors.New("This player is already logged in")
  }

  if foundPassword, found := passwords[name]; found && foundPassword==password {
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
