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
}

func login(msg []byte) error {
  var player players.Player
  if err := json.Unmarshal( msg, &player ); err != nil {
    return err
  } else {
    return players.Login(player)
  }
}

func registerAbout() {
  http.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.WriteHeader(http.StatusOK)
    io.WriteString(w, ABOUT)
  })
}

func registerLogin() {
  http.HandleFunc("/login", func (w http.ResponseWriter, r *http.Request) {
    if conn, err := upgrader.Upgrade(w, r, nil); err != nil {
      log.Printf("LOGIN error: %v", err)
    } else {
      // Read message from browser
      if msgType, msg, err := conn.ReadMessage(); err != nil {
        log.Printf("LOGIN error: %v", err)
      } else {
        s := ""
        err := login(msg)
        if err != nil {
          s = err.Error()
        }
        if err = conn.WriteMessage(msgType, []byte(s)); err != nil {
          log.Printf("LOGIN error: %v", err)
        }
      }
    }
    // TODO send waiting player list for every participant
  })
}

func registerLogout() {
  http.HandleFunc("/logout", func (w http.ResponseWriter, r *http.Request) {
    if conn, err := upgrader.Upgrade(w, r, nil); err != nil {
      log.Printf("LOGOUT error: %v", err)
    } else {
      // Read message from browser
      if _, msg, err := conn.ReadMessage(); err != nil {
        log.Printf("LOGOUT error: %v", err)
      } else {
        players.Logout(string(msg))
        // TODO send waiting player list for every participant
      }
    }
  })
}

func registerPlayerList() {
  http.HandleFunc("/players", func (w http.ResponseWriter, r *http.Request) {
    if conn, err := upgrader.Upgrade(w, r, nil); err != nil {
      log.Printf("PLAYER LIST error: %v", err)
    } else {
      // Read message from browser
      if msgType, msg, err := conn.ReadMessage(); err != nil {
        log.Printf("PLAYER LIST error: %v", err)
      } else {
        list := players.RetrieveWaitingPlayers(string(msg))
        data, err := json.Marshal(list)
        if err != nil {
          log.Printf("PLAYER LIST error: %v", err)
        } else {
          if err = conn.WriteMessage(msgType, data); err != nil {
            log.Printf("PLAYER LIST error: %v", err)
          }
        }
      }
    }
  })
}


func main() {
  players.Init()

  registerAbout()
  registerLogin()
  registerLogout()
  registerPlayerList()

  http.ListenAndServe(":3016", nil)
}

const ABOUT = `
Chess React.js + Web Sockets + Go mediator.

Usage:
  /login - check credential and Login
  /logout - logout from game
  /players - list of waiting players (without me)
`
