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
type Player struct {
  name string
  password string
}
var registeredPlayers [3]Player

func Init() {
  activePlayers = make(map[string]mode, 0)
  registeredPlayers[0] = Player { name:"player-1", password: "123456"}
  registeredPlayers[1] = Player { name:"player-2", password: "654321"}
  registeredPlayers[2] = Player { name:"me", password: "1"}
}

func Login(p Player) error {

  // Is this player active?
  _, active := activePlayers[p.name]
  if active {
    return errors.New("This player is already logged in")
  }

  // Check the password and register
  for _, f := range registeredPlayers {
    if f.name == p.name && f.password == p.password {
      activePlayers[p.name] = waiting
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
