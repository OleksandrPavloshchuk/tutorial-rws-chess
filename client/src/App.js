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
      myMove: undefined,
      message: undefined,
      board: {}
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
    // Init board:
    let b = {};
    b["c11"] = {type: "rook", white: true};
    b["c12"] = {type: "knight", white: true};
    b["c13"] = {type: "bishop", white: true};
    b["c14"] = {type: "queen", white: true};
    b["c15"] = {type: "king", white: true};
    b["c16"] = {type: "bishop", white: true};
    b["c17"] = {type: "knight", white: true};
    b["c18"] = {type: "rook", white: true};
    for( var i=1; i<=8; i++ ) {
      b["c2" + i] = {type: "pawn", white: true};
    }
    b["c81"] = {type: "rook", white: false};
    b["c82"] = {type: "knight", white: false};
    b["c83"] = {type: "bishop", white: false};
    b["c84"] = {type: "queen", white: false};
    b["c85"] = {type: "king", white: false};
    b["c86"] = {type: "bishop", white: false};
    b["c87"] = {type: "knight", white: false};
    b["c88"] = {type: "rook", white: false};
    for( i=1; i<=8; i++ ) {
      b["c7" + i] = {type: "pawn", white: false};
    }

    this.setState({
      whiteMe: white,
      otherPlayer: other,
      myMove: white,
      board: b
    });

  }

  moveOther(move,message) {
    this.setState({myMove:true});
    this.mediatorClient.sendGameMessage(this.state.player, this.state.otherPlayer, "MOVE", message, move);
  }

  askGameEnd(ask, message) {
    this.setState({myMove:true});
    if( window.confirm(ask) ) {
      alert(message);
      this.mediatorClient.sendGameMessage(this.state.player, this.state.otherPlayer, "GAME_END", message);
      this.setState({
        whiteMe: undefined,
        otherPlayer: undefined
      });
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
