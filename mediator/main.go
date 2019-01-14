package main

import (
  "os"
  "fmt"
  "./players"
)

func temp_login(name string, password string) {
  if m := players.Login(name, password); m != nil {
    fmt.Fprintf(os.Stderr, "LOGIN: %s\n", m)
  }
}

func main() {
  players.Init()

  temp_login("player-1", "bebebe")
  temp_login("player-1", "123456")
  temp_login("wrong", "---")
  temp_login("player-2", "654321")
  temp_login("me", "1")
  temp_login("player-2", "654321")

  fmt.Printf("active users = %v\n", players.RetrieveWaitingPlayers("me"))

  players.Logout("player-1")

  fmt.Printf("active users = %v\n", players.RetrieveWaitingPlayers("player-2"))  

}
