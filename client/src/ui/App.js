import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';   
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import MediatorClient from '../services/mediatorClientService';
import BoardData, {key, startY, y, x} from '../services/boardData';
import MoveValidator, {isCheck} from '../services/moveValidator';
import UUID from 'uuid-js';

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
            askResign: false,
            moves: [],
            moveOtherTo: undefined,
            passage: undefined,
            useDragAndDrop: undefined
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
        this.determinePassage = this.determinePassage.bind(this);
        this.sendEndGameMessage = this.sendEndGameMessage.bind(this);
        this.startSession = this.startSession.bind(this);
    }

    componentDidMount() {
        const screenWidth = this.elem.clientWidth;
        var cellSize = screenWidth / 13;
        if( cellSize > baseSize ) {
            cellSize = baseSize;
        }       

        this.setState({
			useDragAndDrop: detectUseDragAndDrop(),
            cellSize
        });
    }
    
    startSession() {
        const login = UUID.create().toString();
        
        console.log('UUID', login);
        
        this.mediatorClient.startSession( login, '', {
                "LOGIN_ERROR": msg => {
                     this.setState({message: msg.text});
                     console.log("ERROR", msg.text);
                },
                "PLAYERS_ADD": msg => this.playersAdd(msg.players),
                "PLAYERS_REMOVE": msg => this.playersRemove(msg.players),
                "GAME_START": msg => this.startGame(msg.from, msg.white),
                "MOVE": msg => this.moveOther(msg.moveFrom, msg.moveTo, msg.piece,
                     msg.text, msg.takeOnPassage),
                "RESIGN": msg => this.win(msg.text),
                "AMEND_LAST_MOVE": msg => this.amendLastMove(msg.text),
                "ASK_DEUCE": () => this.onAskDeuce(),
                "DEUCE": () => this.deuce(),
                "LOGIN_OK": () => this.setPlayer(login)
            }
        );    
    }    

    sendGameMessage(m) {
        m.from = this.state.player;
        m.to = this.state.otherPlayer;
        this.mediatorClient.sendGameMessage(m);
    }

    sendEndGameMessage = (msg, suffix) => {
        this.setState({myMove: true, message: msg, endGame: true});
        this.amendLastMove(suffix);
    }

    isTake = moveTo => !!this.state.board.get(moveTo)
    win = msg => this.sendEndGameMessage(msg, 'X')
    deuce = () => this.sendEndGameMessage('Deuce', ' deuce')
    setPlayer = player => this.setState({player: player}
        )

    isConfirm = () => this.state.askResign || this.state.confirmDeuce || this.state.askDeuce
    onAskDeuce = () => this.setState({myMove: false, confirmDeuce: true}
        )

    logout = () => {
        this.mediatorClient.logout(this.state.player);
        this.setState({player: undefined});
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
            board: new BoardData(white),
            moves: [],
            newPieceType: undefined,
            showConversion: false,
            moveFrom: undefined
        });
    }

    endGame() {
        this.setState({
            otherPlayer: undefined,
            whiteMe: undefined,
            myMove: undefined,
            endGame: false,
            message: undefined,
            board: undefined,
            moveFrom: undefined
        });
    }

    moveStart(moveFrom) {
        this.state.board.calculateAvailableCells(moveFrom, this.state.passage);
        this.setState({board: this.state.board, moveFrom:moveFrom});
    }

    moveComplete(moveFrom, moveTo, take, newPieceType, takeOnPassage) {
        this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: newPieceType});
        this.state.board.setNewPieceType(moveTo, newPieceType);
        this.sendGameMessage({type: "MOVE", moveFrom: moveFrom, moveTo: moveTo,
            piece: newPieceType, takeOnPassage: takeOnPassage});
        this.setState({myMove: false, board: this.state.board, moveFrom:undefined});
    }

    isConversion(moveTo) {
        let p = this.state.board.get(moveTo);
        if ("pawn" !== p.type) {
            return false;
        }
        const lastLine = this.state.whiteMe ? 8 : 1;
        return lastLine === y(moveTo);
    }

    dropPiece(src, moveTo) {
        if(!src.piece) {
           return;
        }

        let moveFrom = src.piece;
        var take = this.isTake(moveTo);
        if (this.state.board.move(moveFrom, moveTo)) {
            const step = this.state.whiteMe ? 1 : -1;
            const pawnKey = key(x(moveTo), y(moveTo) - step);

            var takeOnPassage = undefined;
            if (this.state.passage === pawnKey) {
                take = this.isTake(pawnKey);
                this.state.board.removePiece(pawnKey);
                takeOnPassage = pawnKey;
            }
            if (this.isConversion(moveTo)) {
                this.setState({take: take, moveFrom: moveFrom, moveTo: moveTo, showConversion: true});
            } else {
                this.moveComplete(moveFrom, moveTo, take, undefined, takeOnPassage);
            }
        }
        this.state.board.clearAvailableCells();
        this.setState({board: this.state.board});
    }

    determinePassage(moveFrom, moveTo) {
        const piece = this.state.board.get(moveFrom);
        if (!piece) {
            return undefined;
        }
        if ("pawn" !== piece.type) {
            return undefined;
        }
        const yFrom = y(moveFrom);
        const yTo = y(moveTo);
        if (2 !== Math.abs(yFrom - yTo)) {
            return undefined;
        }
        return moveTo;
    }

    moveOther(moveFrom, moveTo, piece, message, takeOnPassage) {
        const passage = this.determinePassage(moveFrom, moveTo);

        this.setState({moveOtherTo: moveTo, passage: passage});
        let take = this.isTake(moveTo);
        this.state.board.moveOther(moveFrom, moveTo, piece);
        if (takeOnPassage) {
            this.state.board.removePiece(takeOnPassage);
        }
        let check = isCheck(this.state.board, this.state.whiteMe);

        // Calculate all moves (TODO refactor):
        const myFigures = this.state.board.getPieces(true, this.state.whiteMe);
        var counter = 0;
        for (var i = 0; i < myFigures.length; i++) {
            const moves = new MoveValidator(myFigures[i], this.state.board).calculateAvailableCells();
            counter += moves.length - 1;
        }

        if (0 === counter) {
            const msgMy = check ? "Checkmate. You loose." : "Stalemate. Deuce.";
            const msgOther = check ? "Your opponent just got checkmate. You win." : "Stalemate. Deuce.";
            const what = check ? "RESIGN" : "DEUCE";
            const suffix = check ? 'X' : ' deuce';

            this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
            this.setState({myMove: false, endGame: true, message: msgMy, askResign: false});
            this.sendGameMessage({type: "AMEND_LAST_MOVE", text: suffix});
            this.sendGameMessage({type: what, text: msgOther});

            return;
        } else if (check) {
            message = "Check";
        }
        const suffix = check ? '+' : undefined;
        this.sendGameMessage({type: "AMEND_LAST_MOVE", text: suffix});
        this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
        this.setState({myMove: true, message: message, board: this.state.board, moveOtherTo: undefined});
    }

    amendLastMove(suffix) {
        if (this.state.moves.length > 0) {
            const lastMove = this.state.moves[this.state.moves.length - 1];
            const v = this.state.whiteMe ? lastMove.white : lastMove.black;
            if( v )  { v.suffix = suffix; }
            this.setState({moves: this.state.moves});
        }
    }

    addMoveToList(v) {
        let p = this.state.board.get(v.moveTo);
        v.piece = p.type;
        let moves = this.state.moves;
        if (p.white) {
            moves.push({num: this.state.moves.length + 1, white: v});
        } else {
            moves[this.state.moves.length - 1].black = v;
        }
        if (this.isCastling(p, v.moveFrom, v.moveTo, 3)) {
            v.castling = "0-0-0";
        } else if (this.isCastling(p, v.moveFrom, v.moveTo, 7)) {
            v.castling = "0-0";
        }

        this.setState({moves: moves});
    }

    isCastling(p, moveFrom, moveTo, xTo) {
        if ("king" !== p.type) {
            return false;
        }
        const py = startY(p.white);
        if (key(5, py) !== moveFrom) {
            return false;
        }
        return key(xTo, py) === moveTo;
    }

    playersAdd(players) {
        if (!this.state.player) {
            return;
        }
        var p = [];
        this.state.waitingPlayers.forEach(i => p.push(i));
        players.forEach(i => {
            if (this.state.player !== i && !p.includes(i)) {
                p.push(i);
            }
        });
        this.setState({waitingPlayers: p});
    }

    playersRemove(players) {
        var p = [];
        this.state.waitingPlayers.forEach(i => {
            if (this.state.player !== i && !players.includes(i)) {
                p.push(i);
            }
        });
        this.setState({waitingPlayers: p});
    }

    render() {

        return (
        <div className="container"
             ref={elem=>this.elem = elem}>
            {this.state.player
                        ? this.state.otherPlayer ? <BoardPage app={this} /> : <PlayerListPage app={this} />
                        : <LoginPage app={this}/> }
        </div>);
    }
}

function detectUseDragAndDrop() {
	let platform = window.navigator.platform.toUpperCase();    
	return !platform.includes("IPHONE") && !platform.includes("ANDROID");
}

const baseSize = 45;
