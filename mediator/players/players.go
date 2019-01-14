package players

import (
  "errors"
)

type mode int

const (
  waiting = iota
  playing = iota
)

var activePlayers map[string]mode

// TODO (2019/01/14) check credentials from database
type player struct {
  name string
  password string
}
var registeredPlayers [3]player

func Init() {
  activePlayers = make(map[string]mode, 0)
  registeredPlayers[0] = player { name:"player-1", password: "123456"}
  registeredPlayers[1] = player { name:"player-2", password: "654321"}
  registeredPlayers[2] = player { name:"me", password: "1"}
}

func Login(name string, password string) error {

  // Is this player active?
  _, active := activePlayers[name]
  if active {
    return errors.New("This player is already logged in")
  }

  // Check the password and register
  for _, p := range registeredPlayers {
    if p.name == name && p.password == password {
      activePlayers[name] = waiting
      return nil
    }
  }

  return errors.New("Login failed")
}

func Logout(name string) {
  delete(activePlayers, name)
}

func RetrieveWaitingPlayers(myName string) []string {
  r := make([]string, 0)
  for k, v := range activePlayers {
    if waiting == v && myName != k {
      r = append( r, k)
    }
  }
  return r
}
