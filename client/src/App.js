import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import MediatorClient from './mediatorClientService';
import BoardData,{key, startY, y} from './boardData';
import MoveValidator, {isCheck} from './moveValidator.js';

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
    this.sendGameMessage = this.sendGameMessage.bind(this);
    this.amendLastMove = this.amendLastMove.bind(this);
  }

 sendGameMessage(v) {
   v.from = this.state.player;
   v.to = this.state.otherPlayer;
   this.mediatorClient.sendGameMessage(v);
   // TODO remove trace
   // console.log('SENT', v)   
 }

  isTake = moveTo => !!this.state.board.get(moveTo);
  setPlayer = player => this.setState({player : player});
  isConfirm = () => this.state.askSurrender || this.state.confirmDeuce || this.state.askDeuce;
  onAskDeuce = () => this.setState({myMove:true, confirmDeuce:true});
  win = message => {
    this.setState({myMove:true, message:message, endGame:true});
    this.amendLastMove('X');
  }
  deuce = () => { 
    this.setState({myMove:true, message:"Deuce", endGame:true});
    this.amendLastMove(' deuce');
  }
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
    this.addMoveToList({moveFrom:moveFrom, moveTo:moveTo, take:take, newType:newPieceType});
    this.state.board.setNewPieceType( moveTo, newPieceType );
    this.sendGameMessage({what:"MOVE", moveFrom:moveFrom, moveTo:moveTo, piece:newPieceType} );
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
    this.setState({ moveOtherTo:moveTo });
    let take = this.isTake(moveTo);
    this.state.board.moveOther(moveFrom, moveTo, piece);
    let check = isCheck( this.state.board, this.state.whiteMe );        
    
    // Calculate all moves (TODO refactor):
    const myFigures = this.state.board.getPieces(true, this.state.whiteMe);
    var counter = 0;
    for( var i=0; i<myFigures.length; i++ ) {
      const moves = new MoveValidator(myFigures[i], this.state.board).calculateAvailableCells();
      counter += moves.length-1;
    }
    
    if( 0===counter) {
        const msgMy = check ? "Mate. You loose." : "Stalemate. Deuce."; 
        const msgOther = check ? "Your opponent just got mate. You win." : "Stalemate. Deuce.";
        const what = check ? "SURRENDER" : "DEUCE";
        const suffix = check ? 'X' : ' deuce';
        
        this.addMoveToList({ moveFrom:moveFrom, moveTo:moveTo, take:take, newType:piece, suffix:suffix });
        this.setState({ myMove:false, endGame:true, message:msgMy, askSurrender:false });
        this.sendGameMessage({ what:"AMEND_LAST_MOVE", text:suffix }); 
        this.sendGameMessage({ what:what, text:msgOther }); 

        return;
    } else if( check ) { message = "Check"; }
    const suffix = check ? '+' : undefined;
    this.sendGameMessage({what: "AMEND_LAST_MOVE",  text:suffix}); 
    this.addMoveToList({moveFrom:moveFrom, moveTo:moveTo, take:take, newType:piece, suffix:suffix});
    this.setState({myMove:true, message:message, board: this.state.board, moveOtherTo:undefined});
  }
  
  amendLastMove(suffix) {
    if( this.state.moves.length > 0 ) {
      const lastMove = this.state.moves[this.state.moves.length-1];
      const v = this.state.whiteMe ? lastMove.white : lastMove.black;
      v.suffix = suffix;
      this.setState({moves:this.state.moves});
    }
  }

  addMoveToList(v) {
    let p = this.state.board.get(v.moveTo);
    v.piece = p.type;

    // TODO (2019/02/02) show check or mate for this player

    let moves = this.state.moves;
    if( p.white ) {
      moves.push({num:this.state.moves.length+1, white :v});
    } else {
      moves[this.state.moves.length-1].black = v;
    }
    if( this.isCastling(p, v.moveFrom, v.moveTo, 3) ) { v.castling = "0-0-0"; } 
    else if( this.isCastling(p, v.moveFrom, v.moveTo, 7) ) { v.castling = "0-0"; }

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
