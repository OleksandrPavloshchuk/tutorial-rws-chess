import SocketProvider from './socketProvider';
import socketProvider from './gameService';
import BoardData, {key, startY, y, x} from './boardData';
import MoveValidator, {isCheck} from './moveValidator';
import UUID from 'uuid-js';

const initialState = {
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
    useDragAndDrop: true
};

export default (state=initialState, action ) => {
    switch (action.type) {
        case "LOGIN_OK":
            return updateState(s => {s.player = action.payload.from;} );
        case "LOGIN_ERROR":
            return updateState(s => {s.message = action.payload.text;} );
        case "PLAYERS_ADD":
            return updateState(s => playersAdd(action.payload.players));
        case "PLAYERS_REMOVE":
            return updateState(s => playersRemove(action.payload.players));            
        default:
            return state;
    }    
}

const updateState = (state, updater) => {
    const r = Object.assign({}, state); updater(r); return r;            
}

const playersAdd = (s, players) => {
    if( !s.player ) { return; }
    var p = [];
    s.waitingPlayers.forEach(i => p.push(i));
    players.forEach(i => {
        if (this.getState().player !== i && !p.includes(i)) { p.push(i); }
    });    
    s.waitingPlayers = p;
}

const playersRemove = (s, players) => {
    var p = [];
    s.waitingPlayers.forEach(i => {
        if (this.getState().player !== i && !players.includes(i)) { p.push(i); }
    });    
    s.waitingPlayers = p;
}

const amendLastMove = (s, suffix) => {
    if (s.moves.length > 0) {
        const lastMove = s.moves[s.moves.length - 1];
        const v = s.whiteMe ? lastMove.white : lastMove.black;
        if (v) { v.suffix = suffix; }
    }
}

const isCastling = (p, moveFrom, moveTo, xTo) => {
    if ("king" !== p.type) { return false; }
    const py = startY(p.white);
    if (key(5, py) !== moveFrom) { return false; }
    return key(xTo, py) === moveTo;
}

const addMoveToList = (s, v) => {
    let p = s.board.get(v.moveTo);
    v.piece = p.type;
    if (p.white) {
        s.moves.push({num: s.moves.length + 1, white: v});
    } else {
        s.moves[s.moves.length - 1].black = v;
    }
    if (isCastling(p, v.moveFrom, v.moveTo, 3)) { v.castling = "0-0-0";} 
    else if (isCastling(p, v.moveFrom, v.moveTo, 7)) { v.castling = "0-0"; }
}

const determinePassage = (s, moveFrom, moveTo) => {
    const piece = s.board.get(moveFrom);
    if (!piece) { return undefined; }
    if ("pawn" !== piece.type) { return undefined; }
    const yFrom = y(moveFrom); const yTo = y(moveTo);
    if (2 !== Math.abs(yFrom - yTo)) { return undefined; }
    return moveTo;
}

const isTake = (s, moveTo) => !!s.board.get(moveTo);

const moveOther = (s, moveFrom, moveTo, piece, message, takeOnPassage) => {
    const passage = determinePassage(s, moveFrom, moveTo);
    s.moveOtherTo = moveTo; s.passage = passage;
    const take = isTake(s, moveTo);
    
    s.board.moveOther(moveFrom, moveTo, piece);
    
    if (takeOnPassage) {
        s.board.removePiece(takeOnPassage);
    }
    let check = isCheck(s.board, s.whiteMe);

    // Calculate all moves (TODO refactor):
    const myFigures = s.board.getPieces(true, s.whiteMe);
    var counter = 0;
    for (var i = 0; i < myFigures.length; i++) {
        const moves = new MoveValidator(myFigures[i], s.board).calculateAvailableCells();
        counter += moves.length - 1;
    }

    if (0 === counter) {
        const msgMy = check ? "Checkmate. You loose." : "Stalemate. Deuce.";
        const msgOther = check ? "Your opponent just got checkmate. You win." : "Stalemate. Deuce.";
        const what = check ? "RESIGN" : "DEUCE";
        const suffix = check ? 'X' : ' deuce';

        addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
        s.myMove = false; s.endGame = true; s.message = msgMy; s.askResign = false;
        
        sendGameMessage(s, {type: "AMEND_LAST_MOVE", payload:{text: suffix}});
        sendGameMessage(s, {type: what, payload:{text: msgOther}});

        return;
    } else if (check) {
        message = "Check";
    }
    const suffix = check ? '+' : undefined;
    sendGameMessage(s, {type: "AMEND_LAST_MOVE", payload: {text: suffix}});
    addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix});
    s.moveOtherTo = undefined; s.message = message; s.myMove = true;
}

const sendGameMessage = (s, a) => {
    if(!a.payload) { a.payload = {}; }
    a.payload.from = s.player;
    a.payload.to = s.otherPlayer;
    socketProvider.sendAction(a);
}

const sendEndGameMessage = (s, msg, suffix) => {
    s.myMove =true; s.message = msg; s.endGame = true;
    amendLastMove(s, suffix);
}

const win = (s, msg) => sendEndGameMessage(s, msg, 'X');
const deuce = s => sendEndGameMessage(s, 'Deuce', ' deuce');

const isConfirm = s => s.askResign || s.confirmDeuce || s.askDeuce;

const onAskDeuce = s => { s.myMove = false; s.confirmDeuce = true;};

const logout = s => { socketProvider.logout(s.player); s.player = undefined; };

const startGameMe = (s, other, white) => {
    socketProvider.startGame(s.player, other, !white);
    startGame(other, white);
};

const startGame = (s, other, white) => {
    s.endGame = false; s.whiteMe = white; s.otherPlayer = other;
    s.myMove = white; s.board = new BoardData(white); s.moves = [];
    s.showConversion = false;
    s.newPieceType = undefined;
    s.moveFrom = undefined;
};

const endGame = s => {
    s.otherPlayer = undefined;
    s.whiteMe = undefined;
    s.myMove = undefined;
    s.endGame = false;
    s.message = undefined;
    s.board = undefined;
    s.moveFrom = undefined;
};

const moveStart = (s, moveFrom) => {
    s.board.calculateAvailableCells(moveFrom, s.passage);
    s.moveFrom = moveFrom;
};

const moveComplete = (s, moveFrom, moveTo, take, newPieceType, takeOnPassage) => {
    addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: newPieceType});
    s.board.setNewPieceType(moveTo, newPieceType);
    sendGameMessage(s, {type: "MOVE", payload:{moveFrom: moveFrom, moveTo: moveTo,
        piece: newPieceType, takeOnPassage: takeOnPassage}});
    s.myMove = false; s.moveFrom = undefined;
};

const isConversion = (s, moveTo) => {
    let p = s.board.get(moveTo);
    if ("pawn" !== p.type) { return false; }
    const lastLine = s.whiteMe ? 8 : 1;
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

