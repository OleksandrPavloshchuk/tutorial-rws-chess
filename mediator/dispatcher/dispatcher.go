package dispatcher

import (
	"../service/authentication"
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
	What     string   `json:"what"`
	From     string   `json:"from"`
	To       string   `json:"to"`
	Players  []string `json:"players"`
	Password string   `json:"password"`
	White    bool     `json:"white"`
	Text     string   `json:"text"`
}

type playerSession struct {
	name        string
	otherPlayer string
	connection  *websocket.Conn
	mode        int
}

var activePlayers map[string]playerSession

func Init() {
	activePlayers = make(map[string]playerSession, 0)
}

func RemovePlayer(addr net.Addr) {
	for name, session := range activePlayers {
		if session.connection.RemoteAddr() == addr {
			log.Printf("Connection to player %v is lost\n", name)
			if session.mode == playing {
				// Warn opponent that he wins:
				content, _ := json.Marshal(Message{What: "SURRENDER", Text: "You win, because your opponent is gone"})
				if otherSession, found := activePlayers[session.otherPlayer]; found {
					changePlayerMode(session.otherPlayer, "", waiting)
					otherSession.connection.WriteMessage(websocket.TextMessage, content)
					updatePlayers("PLAYERS_ADD", []string{session.otherPlayer})
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
		err := login(msg.From, msg.Password, connection)
		res := Message{What: "LOGIN_OK"}
		if err != nil {
			res.What = "LOGIN_ERROR"
			res.Text = err.Error()
		}
		return &res, false
	case "LOGOUT":
		log.Printf("logout: %v\n", msg.From)
		removePlayer(msg.From)
		return nil, true
	case "ASK_PLAYERS":
		res := Message{What: "PLAYERS_ADD", Players: retrievePlayers()}
		return &res, false
	case "GAME_START":
		changePlayersMode(msg, playing)
		return nil, false
	case "MOVE", "ASK_DEUCE", "AMEND_LAST_MOVE", "SURRENDER", "DEUCE":
		passMessageToReceiver(msg.To, unparsedMsg)
		if msg.What == "SURRENDER" || msg.What == "DEUCE" {
			changePlayersMode(msg, waiting)
		}
		return nil, false
	default:
		log.Println("DISPATCH: unexpected message: %v\n", msg)
		return nil, false
	}
	return nil, false
}

func changePlayersMode(msg *Message, mode int) {
    what := "PLAYERS_ADD"
    if mode==playing {
		what = "PLAYERS_REMOVE"
	}
	changePlayerMode(msg.From, msg.To, mode)
	changePlayerMode(msg.To, msg.From, mode)
	updatePlayers(what, []string{msg.From, msg.To})
	content, _ := json.Marshal(msg)
	if session, found := activePlayers[msg.To]; found {
		session.connection.WriteMessage(websocket.TextMessage, content)
	}
}

func changePlayerMode(player string, otherPlayer string, mode int) {
	s, _ := activePlayers[player]
	s.mode = mode
	if mode == playing {
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
	if authentication.CheckPassword(name, password) {
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
