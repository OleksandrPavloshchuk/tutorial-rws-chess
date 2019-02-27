import MediatorClient from './mediatorClientService';
import BoardData, {key, startY, y, x} from './boardData';
import MoveValidator, {isCheck} from './moveValidator';
import UUID from 'uuid-js';
import reducer from './reducer';

export default class GameService {

    constructor(component) {
        this.component = component;        
        this.mediatorClient = new MediatorClient();

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
        this.setInitialState = this.setInitialState.bind(this);
        this.setState = this.setState.bind(this);
        this.getState = this.getState.bind(this);
        this.calculateCellSize = this.calculateCellSize.bind(this);
        
        this.dispatch = this.dispatch.bind(this);
        this.reducer = reducer;      
    }
    
    dispatch = action => this.setState( this.reducer( this.getState(), action, this ) );
    
    setInitialState = () => this.setState({
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
        });
    
    setState = s => this.component.setState(s);
    getState = () => this.component.state;        

    calculateCellSize(screenWidth) {
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
        this.mediatorClient.startSession( login, '', {
                "LOGIN_ERROR": msg => {
                     this.setState({message: msg.payload.text});
                     console.log("ERROR", msg.payload.text);
                },
                "PLAYERS_ADD": msg => this.playersAdd(msg.payload.players),
                "PLAYERS_REMOVE": msg => this.playersRemove(msg.payload.players),
                "GAME_START": msg => this.startGame(msg.payload.from, msg.payload.white),
                "MOVE": msg => this.moveOther(msg.payload.moveFrom, msg.payload.moveTo, msg.payload.piece,
                     msg.payload.text, msg.payload.takeOnPassage),
                "RESIGN": msg => this.win(msg.payload.text),
                "AMEND_LAST_MOVE": msg => this.amendLastMove(msg.payload.text),
                "ASK_DEUCE": () => this.onAskDeuce(),
                "DEUCE": () => this.deuce(),
                "LOGIN_OK": () => this.setPlayer(login)
            }
        );    
    }    

    sendGameMessage(m) {
        if(!m.payload) {
            m.payload = {};
        }
        m.payload.from = this.getState().player;
        m.payload.to = this.getState().otherPlayer;
        this.mediatorClient.sendGameMessage(m);
    }

    sendEndGameMessage = (msg, suffix) => {
        this.setState({myMove: true, message: msg, endGame: true});
        this.amendLastMove(suffix);
    }

    isTake = moveTo => !!this.getState().board.get(moveTo)
    win = msg => this.sendEndGameMessage(msg, 'X')
    deuce = () => this.sendEndGameMessage('Deuce', ' deuce')
    setPlayer = player => this.setState({player: player}
        )

    isConfirm = () => this.getState().askResign || this.getState().confirmDeuce || this.getState().askDeuce
    onAskDeuce = () => this.setState({myMove: false, confirmDeuce: true}
        )

    logout = () => {
        this.mediatorClient.logout(this.getState().player);
        this.setState({player: undefined});
    }

    startGameMe(other, white) {
        this.mediatorClient.startGame(this.getState().player, other, !white);
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
        this.getState().board.calculateAvailableCells(moveFrom, this.getState().passage);
        this.setState({board: this.getState().board, moveFrom:moveFrom});
    }

    moveComplete(moveFrom, moveTo, take, newPieceType, takeOnPassage) {
        this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: newPieceType});
        this.getState().board.setNewPieceType(moveTo, newPieceType);
        this.sendGameMessage({type: "MOVE", payload:{moveFrom: moveFrom, moveTo: moveTo,
            piece: newPieceType, takeOnPassage: takeOnPassage}});
        this.setState({myMove: false, board: this.getState().board, moveFrom:undefined});
    }

    isConversion(moveTo) {
        let p = this.getState().board.get(moveTo);
        if ("pawn" !== p.type) {
            return false;
        }
        const lastLine = this.getState().whiteMe ? 8 : 1;
        return lastLine === y(moveTo);
    }

    dropPiece(src, moveTo) {
        if(!src.piece) {
           return;
        }

        let moveFrom = src.piece;
        var take = this.isTake(moveTo);
        if (this.getState().board.move(moveFrom, moveTo)) {
            const step = this.getState().whiteMe ? 1 : -1;
            const pawnKey = key(x(moveTo), y(moveTo) - step);

            var takeOnPassage = undefined;
            if (this.getState().passage === pawnKey) {
                take = this.isTake(pawnKey);
                this.getState().board.removePiece(pawnKey);
                takeOnPassage = pawnKey;
            }
            if (this.isConversion(moveTo)) {
                this.setState({take: take, moveFrom: moveFrom, moveTo: moveTo, showConversion: true});
            } else {
                this.moveComplete(moveFrom, moveTo, take, undefined, takeOnPassage);
            }
        }
        this.getState().board.clearAvailableCells();
        this.setState({board: this.getState().board});
    }

    determinePassage(moveFrom, moveTo) {
        const piece = this.getState().board.get(moveFrom);
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
        this.getState().board.moveOther(moveFrom, moveTo, piece);
        if (takeOnPassage) {
            this.getState().board.removePiece(takeOnPassage);
        }
        let check = isCheck(this.getState().board, this.getState().whiteMe);

        // Calculate all moves (TODO refactor):
        const myFigures = this.getState().board.getPieces(true, this.getState().whiteMe);
        var counter = 0;
        for (var i = 0; i < myFigures.length; i++) {
            const moves = new MoveValidator(myFigures[i], this.getState().board).calculateAvailableCells();
            counter += moves.length - 1;
        }

        if (0 === counter) {
            const msgMy = check ? "Checkmate. You loose." : "Stalemate. Deuce.";
            const msgOther = check ? "Your opponent just got checkmate. You win." : "Stalemate. Deuce.";
            const what = check ? "RESIGN" : "DEUCE";
            const suffix = check ? 'X' : ' deuce';

            this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
            this.setState({myMove: false, endGame: true, message: msgMy, askResign: false});
            this.sendGameMessage({type: "AMEND_LAST_MOVE", payload:{text: suffix}});
            this.sendGameMessage({type: what, payload:{text: msgOther}});

            return;
        } else if (check) {
            message = "Check";
        }
        const suffix = check ? '+' : undefined;
        this.sendGameMessage({type: "AMEND_LAST_MOVE", payload: {text: suffix}});
        this.addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
        this.setState({myMove: true, message: message, board: this.getState().board, moveOtherTo: undefined});
    }

    amendLastMove(suffix) {
        if (this.getState().moves.length > 0) {
            const lastMove = this.getState().moves[this.getState().moves.length - 1];
            const v = this.getState().whiteMe ? lastMove.white : lastMove.black;
            if( v )  { v.suffix = suffix; }
            this.setState({moves: this.getState().moves});
        }
    }

    addMoveToList(v) {
        let p = this.getState().board.get(v.moveTo);
        v.piece = p.type;
        let moves = this.getState().moves;
        if (p.white) {
            moves.push({num: this.getState().moves.length + 1, white: v});
        } else {
            moves[this.getState().moves.length - 1].black = v;
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
        if (!this.getState().player) {
            return;
        }
        var p = [];
        this.getState().waitingPlayers.forEach(i => p.push(i));
        players.forEach(i => {
            if (this.getState().player !== i && !p.includes(i)) {
                p.push(i);
            }
        });
        this.setState({waitingPlayers: p});
    }

    playersRemove(players) {
        var p = [];
        this.getState().waitingPlayers.forEach(i => {
            if (this.getState().player !== i && !players.includes(i)) {
                p.push(i);
            }
        });
        this.setState({waitingPlayers: p});
    }

}

function detectUseDragAndDrop() {
	let platform = window.navigator.platform.toUpperCase();    
	return !platform.includes("IPHONE") && !platform.includes("ANDROID");
}

const baseSize = 45;
