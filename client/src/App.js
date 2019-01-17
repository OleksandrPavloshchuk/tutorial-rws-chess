import React, { Component } from 'react';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage'
import PlayerListPage from './PlayerListPage'
import BoardPage from './BoardPage'
import MediatorClient from './mediatorClientService'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();

    this.state = {
      waitingPlayers: [],
      player: undefined,
      otherPlayer: undefined,
      whiteMe: undefined,
      myMove: undefined
    };

    this.setPlayer = this.setPlayer.bind(this);
    this.logout = this.logout.bind(this);
    this.playersAdd = this.playersAdd.bind(this);
    this.playersRemove = this.playersRemove.bind(this);
    this.startGame = this.startGame.bind(this);
    this.startGameMe = this.startGameMe.bind(this);
    this.moveOther = this.moveOther.bind(this);
    this.askGameEnd = this.askGameEnd.bind(this);
    this.gameEnd = this.gameEnd.bind(this);
  }

  setPlayer(player) {
    this.setState({player : player});
  }

  startGameMe(other, white) {
    this.mediatorClient.startGame(this.state.player, other, !white);
    this.startGame(other, white);
  }

  startGame(other, white) {
    this.setState({
      whiteMe: white,
      otherPlayer: other,
      myMove: white
    });
  }

  moveOther(move) {
    console.log("move other", move);
  }

  askGameEnd(what, ask, message) {
    if( window.confirm(ask) ) {
      alert(message);
      this.setState({
        whiteMe: undefined,
        otherPlayer: undefined
      });
      this.mediatorClient.sendGameMessage(this.state.player, this.state.otherPlayer, what);
    }
  }

  gameEnd(message) {
    alert(message);
    this.setState({
      whiteMe: undefined,
      otherPlayer: undefined
    });
  }

  logout() {
    this.mediatorClient.logout(this.state.player);
    this.setState({player : undefined});
  }

  playersAdd(players) {
    if( !this.state.player ) {
      return;
    }
    var p = [];
    this.state.waitingPlayers.forEach(i => p.push(i));
    players.forEach(i => {
      if ( this.state.player!==i && !p.includes(i) ) {
        p.push(i);
      }
    });
    this.setState({waitingPlayers:p});
  }

  playersRemove(players) {
    var p = [];
    this.state.waitingPlayers.forEach(i => {
      if ( this.state.player!==i && !players.includes(i) ) {
        p.push(i);
      }
    });
    this.setState({waitingPlayers:p});
  }

  render() {

    return (
      <div className="container">
        {!this.state.player &&
          <LoginPage parent={this}/>
        }
        {(this.state.player && !this.state.otherPlayer) &&
          <PlayerListPage parent={this} />
        }
        {(this.state.player && this.state.otherPlayer) &&
          <BoardPage parent={this} />
        }
      </div>
    );
  }
}
