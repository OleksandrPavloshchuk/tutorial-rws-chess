import React, { Component } from 'react';

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
      board: undefined
    };

    this.setPlayer = this.setPlayer.bind(this);
    this.logout = this.logout.bind(this);
    this.playersAdd = this.playersAdd.bind(this);
    this.playersRemove = this.playersRemove.bind(this);
    this.startGame = this.startGame.bind(this);
    this.startGameMe = this.startGameMe.bind(this);
    this.moveStart = this.moveStart.bind(this);
    this.moveComplete = this.moveComplete.bind(this);
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
      myMove: white,
      board: new Board()
    });
  }

  moveStart(src) {
    this.state.board.calculateAvailableCells(src);
    this.setState({board: this.state.board});
  }

  moveComplete(src, moveTo) {
    let moveFrom = src.piece;
    if( this.state.board.move(moveFrom, moveTo) ) {
      this.setState({myMove:false, board: this.state.board});

      this.mediatorClient.sendGameMessage(
        this.state.player, this.state.otherPlayer,
        "MOVE", undefined, moveFrom, moveTo);
    }
  }

  moveOther(moveFrom, moveTo, message) {
    // TODO show message, if presents

    this.state.board.move(moveFrom, moveTo);
    this.setState({myMove:true, board: this.state.board});
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
          <LoginPage app={this}/>
        }
        {(this.state.player && !this.state.otherPlayer) &&
          <PlayerListPage app={this} />
        }
        {(this.state.player && this.state.otherPlayer) &&
          <BoardPage app={this} />
        }
      </div>
    );
  }
}

class Board {
  constructor() {
    this.init = this.init.bind(this);
    this.get = this.get.bind(this);
    this.move = this.move.bind(this);
    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
    this.isAvailable = this.isAvailable.bind(this);

    this.data = this.init();
    this.availableCells = [];
  }

  get(pos) {
    return this.data[pos];
  }

  move(moveFrom, moveTo) {
    if( moveFrom===moveTo ) {
      return false;
    }
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
    return true;
  }

  init() {
    // Init board:
    var b = {};

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
    return b;
  }

  calculateAvailableCells(src) {
    this.availableCells = [];
    // TODO: implement this correct
    for( let x=1; x<=8; x++ ) {
      for( let y=1; y<=8; y++ ) {
        this.availableCells.push("c" + y + x);
      }
    }
  }

  isAvailable(c) {
    return this.availableCells.includes(c);
  }

}

// TODO show them in move list
const pieceLabels = {
  "pawn": "", "rook": "R", "knight": "N",
  "bishop": "B", "queen": "Q", "king": "K"
}
