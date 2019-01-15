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
  Name string `json:"name"`
  Password string `json:"password"`
}
var registeredPlayers [3]Player

func Init() {
  activePlayers = make(map[string]mode, 0)
  registeredPlayers[0] = Player { Name:"player-1", Password: "123456"}
  registeredPlayers[1] = Player { Name:"player-2", Password: "654321"}
  registeredPlayers[2] = Player { Name:"me", Password: "1"}
}

func Login(p Player) error {

  // Is this player active?
  /* TODO temporary commented
  _, active := activePlayers[p.Name]
  if active {
    return errors.New("This player is already logged in")
  }
  */

  // Check the password and register
  for _, f := range registeredPlayers {
    if f.Name == p.Name && f.Password == p.Password {
      activePlayers[p.Name] = waiting
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
