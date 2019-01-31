import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import MediatorClient from './mediatorClientService';
import BoardData,{key, startY, y} from './boardData';

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
      newPieceType: undefined,
      showConversion: false,
      askDeuce: false,
	  confirmDeuce: false,
      askSurrender: false,
      moves: [],
      moveOtherTo: undefined
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
    this.isTake = this.isTake.bind(this);
    this.dropPiece = this.dropPiece.bind(this);
    this.isCastling = this.isCastling.bind(this);
    this.isConversion = this.isConversion.bind(this);
    this.isConfirm = this.isConfirm.bind(this);
  }

  isTake = moveTo => !!this.state.board.get(moveTo);
  setPlayer = player => this.setState({player : player});
  isConfirm = () => this.state.askSurrender || this.state.confirmDeuce || this.state.askDeuce;
  onAskDeuce = () => this.setState({myMove:true, confirmDeuce:true});
  win = message => this.setState({myMove:true, message:message, endGame:true});
  deuce = () => this.setState({myMove:true, message:"Deuce", endGame:true});
  logout = () => { this.mediatorClient.logout(this.state.player); this.setState({player : undefined}); }

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
      board: new BoardData(white),
      moves: [],
      newPieceType: undefined,
      showConversion: false
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

  moveComplete(moveFrom, moveTo, take, newPieceType) {
    this.addMoveToList(moveFrom, moveTo, take, newPieceType);
    this.state.board.setNewPieceType( moveTo, newPieceType );
    this.mediatorClient.sendGameMessage(
      this.state.player, this.state.otherPlayer, "MOVE", undefined, moveFrom, moveTo, newPieceType );
    this.setState({myMove:false, board: this.state.board});
  }
  
  isConversion(moveFrom, moveTo) {
    let p = this.state.board.get(moveTo);
    if( "pawn"!==p.type ) { return false; }
    return (this.state.whiteMe && 8===y(moveTo)) || (!this.state.whiteMe && 1===y(moveTo));
  }

  dropPiece(src, moveTo) {
    let moveFrom = src.piece;
    let take = this.isTake(moveTo);
    if( this.state.board.move(moveFrom, moveTo) ) {
      if( this.isConversion(moveFrom, moveTo) ) {
        this.setState({take:take, moveFrom:moveFrom, moveTo:moveTo, showConversion:true});
      } else {
        this.moveComplete( moveFrom, moveTo, take );
      }
    }
    this.state.board.clearAvailableCells();
    this.setState({board: this.state.board});
  }

  moveOther(moveFrom, moveTo, piece, message) {
    this.setState({ otherMoveTo:moveTo });
    let take = this.isTake(moveTo);
    this.state.board.moveOther(moveFrom, moveTo, piece);
    this.addMoveToList(moveFrom, moveTo, take, piece);
    this.setState({myMove:true, message:message, board: this.state.board, otherMoveTo:undefined});
  }

  addMoveToList(moveFrom, moveTo, take, newPieceType) {
    let p = this.state.board.get(moveTo);
    let v = { piece:p.type, moveFrom:moveFrom, moveTo:moveTo, take:take, newType: newPieceType };

    let moves = this.state.moves;
    if( p.white ) {
      moves.push({num:this.state.moves.length+1, white :v});
    } else {
      moves[this.state.moves.length-1].black = v;
    }
    if( this.isCastling(p, moveFrom, moveTo, 3) ) { v.castling = "0-0-0"; } 
    else if( this.isCastling(p, moveFrom, moveTo, 7) ) { v.castling = "0-0"; }

    this.setState({moves:moves});
  }

  isCastling(p, moveFrom, moveTo, xTo) {
    if( "king"!==p.type ) { return false; }
    const py = startY(p.white);
    if( key(5,py)!==moveFrom ) { return false; }
    return key(xTo,py)===moveTo;
  }

  playersAdd(players) {
    if( !this.state.player ) {
      return;
    }
    var p = [];
    this.state.waitingPlayers.forEach(i => p.push(i));
    players.forEach(i => {
      if ( this.state.player!==i && !p.includes(i) ) { p.push(i); }
    });
    this.setState({waitingPlayers:p});
  }

  playersRemove(players) {
    var p = [];
    this.state.waitingPlayers.forEach(i => {
      if ( this.state.player!==i && !players.includes(i) ) { p.push(i); }
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
