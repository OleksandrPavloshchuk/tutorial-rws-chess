package main

import (
	"./players"
	"encoding/json"
	"github.com/gorilla/websocket"
	"io"
	"log"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func registerAbout() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, ABOUT)
	})
}

func registerWebSocket() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("web socket error: %v\n", err)
			return
		}
		for {
			msgType, msgData, err := conn.ReadMessage()
			if exitIfError(err, conn) {
				return
			}

			msgSrc := players.Message{}
			if err := json.Unmarshal(msgData, &msgSrc); err != nil {
				log.Printf("web socket: can't parse message. Ignored: %v\n", err)
			} else {
				// TODO remove trace
				log.Printf("TRACE: msg=%v\n", msgSrc)

				if msgRes, doExit := players.DispatchMessage(&msgSrc, &msgData, conn); doExit {
					return
				} else if msgRes != nil {
					msgData, _ = json.Marshal(*msgRes)
					if exitIfError(conn.WriteMessage(msgType, msgData), conn) {
						return
					}
				}
			}
		}
	})
}

func exitIfError(err error, conn *websocket.Conn) bool {
	if err == nil {
		return false
	}
	log.Printf("web socket error: %v. Close connection.\n", err)
	players.RemovePlayer(conn.RemoteAddr())
	return true
}

func main() {
	players.Init()

	registerAbout()
	registerWebSocket()

	log.Printf(ABOUT)

	http.ListenAndServe(":3016", nil)
}

const ABOUT = `
--------
Chess React.js + Web Sockets + Go mediator
--------`
