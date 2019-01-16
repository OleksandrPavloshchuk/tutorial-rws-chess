package main

import (
  "io"
  "log"
  "net/http"
  "encoding/json"
  "github.com/gorilla/websocket"
  "./players"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
  CheckOrigin: func(r *http.Request) bool { return true },
}

func registerAbout() {
  http.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.WriteHeader(http.StatusOK)
    io.WriteString(w, ABOUT)
  })
}

func registerWebSocket() {
  http.HandleFunc("/ws", func (w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err!=nil {
      log.Printf("web socket error = %v\n", err)
      return;
    }
    for {
      msgType, msgData, err := conn.ReadMessage()
      if err!=nil {
        players.RemovePlayer(conn.RemoteAddr())
        conn.Close()
        log.Printf("web socket error: %v. Close connection.\n", err)
        return
      }

      msgSrc := players.Message{}
      if err := json.Unmarshal( msgData, &msgSrc ); err != nil {
        log.Printf("web socket: can't parse message. Ignored: %v\n", err)
      } else {
        msgRes, err := players.DispatchMessage(msgSrc, conn)
        if err != nil {
          log.Printf("dispatch error. Skipped: %v\n", err)
        } else {
          if msgRes.What=="LOGOUT" {
            conn.Close()
            return
          }
          if msgRes.What!="NONE" {
            msgData,_ = json.Marshal(msgRes)
            err = conn.WriteMessage(msgType, msgData)
            if err!=nil {
              log.Printf("web socket error = %v\n", err)
              return
            }
          }
        }
      }
    }
  })
}

func main() {
  players.Init()

  registerAbout()
  registerWebSocket()

  http.ListenAndServe(":3016", nil)
}

const ABOUT = `
Chess React.js + Web Sockets + Go mediator.

Usage:
  /ws - web socket channels
`
