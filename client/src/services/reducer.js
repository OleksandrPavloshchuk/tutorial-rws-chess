import SocketProvider from './socketProvider';
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
