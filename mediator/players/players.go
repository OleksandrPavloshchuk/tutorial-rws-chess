package players

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/websocket"
	"log"
	"net"
)

const (
	waiting = iota
	playing = iota
)

type Message struct {
	What      string   `json:"what"`
	Sender    string   `json:"from"`
	Receiver  string   `json:"to"`
	Players   []string `json:"players"`
	Password  string   `json:"password"`
	Text      string   `json:"text"`
	MoveFrom  string   `json:"moveFrom"`
	MoveTo    string   `json:"moveTo"`
	White     bool     `json:"white"`
}

// TODO (2019/01/14) check credentials from database
var passwords map[string]string

type playerSession struct {
	name        string
	otherPlayer string
	connection  *websocket.Conn
	mode        int
}

var activePlayers map[string]playerSession

func Init() {
	activePlayers = make(map[string]playerSession, 0)
	passwords = make(map[string]string, 4)
	passwords["player-1"] = "123456"
	passwords["player-2"] = "654321"
	passwords["me"] = "1"
	passwords["player-3"] = "1"
}

func RemovePlayer(addr net.Addr) {
	for name, session := range activePlayers {
		if session.connection.RemoteAddr() == addr {
			log.Printf("Connection to player %v is lost\n", name)
			if session.mode==playing {
				// Send message to opponent that he wins:
				msg := Message{What: "GAME_END", Text: "You win, beacause your opponent is gone"}
				content, _ := json.Marshal(msg)
				if otherSession, found := activePlayers[session.otherPlayer]; found {
					otherSession.connection.WriteMessage(websocket.TextMessage, content)
				}
			}
			removePlayer(name)
			return
		}
	}
}

func DispatchMessage(msg *Message, unparsedMsg *[]byte, connection *websocket.Conn) (*Message, bool) {
	switch msg.What {
	case "ASK_LOGIN":
		err := login(msg.Sender, msg.Password, connection)
		res := Message{What: "LOGIN_OK"}
		if err != nil {
			res.What = "LOGIN_ERROR"
			res.Text = err.Error()
		}
		return &res, false
	case "LOGOUT":
		log.Printf("logout: %v\n", msg.Sender)
		removePlayer(msg.Sender)
		return nil, true
	case "ASK_PLAYERS":
		res := Message{What: "PLAYERS_ADD", Players: retrievePlayers()}
		return &res, false
	case "GAME_START":
		changePlayersMode(msg, "PLAYERS_REMOVE", playing)
		return nil, false
	case "MOVE", "ASK_DEUCE":
		passMessageToReceiver(msg.Receiver, unparsedMsg)
		return nil, false
	case "SURRENDER", "DEUCE":
		passMessageToReceiver(msg.Receiver, unparsedMsg)
		changePlayersMode(msg, "PLAYERS_ADD", waiting)
		return nil, false
	default:
		log.Println("DISPATCH: unexpected message: %v\n", msg)
		return nil, false
	}
	return nil, false
}

func changePlayersMode(msg *Message, what string, mode int) {
	changePlayerMode(msg.Sender, msg.Receiver, mode)
	changePlayerMode(msg.Receiver, msg.Sender, mode)
	updatePlayers(what, []string{msg.Sender, msg.Receiver})
	content, _ := json.Marshal(msg)
	if session, found := activePlayers[msg.Receiver]; found {
		session.connection.WriteMessage(websocket.TextMessage, content)
	}
}

func changePlayerMode(player string, otherPlayer string, mode int) {
	s, _ := activePlayers[player]
	s.mode = mode
	if mode==playing {
		s.otherPlayer = otherPlayer
	} else {
		s.otherPlayer = ""
	}
	activePlayers[player] = s
}

func passMessageToReceiver(receiver string, unparsedMsg *[]byte) {
	session, found := activePlayers[receiver]
	if !found {
		// Probably this player is already gone
		updatePlayers("PLAYERS_REMOVE", []string{receiver})
	} else if session.mode == playing {
		session.connection.WriteMessage(websocket.TextMessage, *unparsedMsg)
	}
}

func updatePlayers(what string, players []string) {
	if len(players) == 0 {
		return
	}
	msg := Message{What: what, Players: players}
	content, _ := json.Marshal(msg)
	for _, session := range activePlayers {
		session.connection.WriteMessage(websocket.TextMessage, content)
	}
}

func login(name string, password string, connection *websocket.Conn) error {

	if _, found := activePlayers[name]; found {
		return errors.New("This player is already logged in")
	}

	if foundPassword, found := passwords[name]; found && foundPassword == password {
		activePlayers[name] = playerSession{name: name, connection: connection, mode: waiting}
		updatePlayers("PLAYERS_ADD", []string{name})
		log.Printf("login: %v\n", name)
		return nil
	}

	return errors.New("Login failed")
}

func removePlayer(name string) {
	session, found := activePlayers[name]
	if found {
		session.connection.Close()
		delete(activePlayers, name)
	}
	updatePlayers("PLAYERS_REMOVE", []string{name})
}

func retrievePlayers() []string {
	r := make([]string, 0)
	for k, session := range activePlayers {
		if waiting == session.mode {
			r = append(r, k)
		}
	}
	return r
}
