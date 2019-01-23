import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import MediatorClient from './mediatorClientService';
import BoardData from './boardData';

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
      endGame: false,
      message: undefined,
      board: undefined,
      moves: []
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
    this.onAskDeuce = this.onAskDeuce.bind(this);
    this.win = this.win.bind(this);
    this.deuce = this.deuce.bind(this);
    this.endGame = this.endGame.bind(this);
    this.addMoveToList = this.addMoveToList.bind(this);
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
      endGame: false,
      whiteMe: white,
      otherPlayer: other,
      myMove: white,
      board: new BoardData(),
      moves: []
    });
  }

  endGame() {
    this.setState({
      otherPlayer: undefined,
      whiteMe: undefined,
      myMove: undefined,
      endGame: false,
      message: undefined,
      board: undefined
    });
  }

  moveStart(src) {
    this.state.board.calculateAvailableCells(src);
    this.setState({board: this.state.board});
  }

  moveComplete(src, moveTo) {
    let moveFrom = src.piece;
    if( this.state.board.move(moveFrom, moveTo) ) {
      this.addMoveToList(moveFrom, moveTo);
      this.setState({myMove:false, board: this.state.board});

      this.mediatorClient.sendGameMessage(
        this.state.player, this.state.otherPlayer,
        "MOVE", undefined, moveFrom, moveTo, this.state.board.get(moveTo).type );
    }
    this.state.board.clearAvailableCells();
    this.setState({board: this.state.board});
  }

  moveOther(moveFrom, moveTo, piece, message) {
    this.state.board.moveOther(moveFrom, moveTo, piece);
    this.addMoveToList(moveFrom, moveTo);
    this.setState({myMove:true, message:message, board: this.state.board});
  }

  addMoveToList(moveFrom, moveTo) {
    // TODO (2019/01/23) determine type of move: take or move
    let p = this.state.board.get(moveTo);
    let v = { piece: p.type, moveFrom: moveFrom, moveTo: moveTo };
    if( p.white ) {
        this.state.moves.push({
            num: this.state.moves.length+1,
            white : v
        });
    } else {
      this.state.moves[this.state.moves.length-1].black = v;
    }
    this.setState({moves:this.state.moves});
  }

  win(message) {
    this.setState({myMove:true, message:message, endGame:true});
  }

  onAskDeuce() {
    this.setState({myMove:true});
    if( window.confirm("Accept deuce?") ) {
      this.deuce();
      this.mediatorClient.sendGameMessage(this.state.player, this.state.otherPlayer, "DEUCE");
    }
  }

  deuce() {
    this.setState({myMove:true, message: "Deuce", endGame:true});
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
