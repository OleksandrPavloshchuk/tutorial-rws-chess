import MediatorClient from '../services/mediatorClientService';
import BoardData, {key, startY, y, x} from '../services/boardData';
import MoveValidator, {isCheck} from '../services/moveValidator';
import UUID from 'uuid-js';

const mediatorClient = new MediatorClient();

export default (state, action) => {
    switch (action.type) {
        default:
            return state;
    }    
};

/*
export default (state, action) => {
    switch (action.type) {
        case "PLAYERS_ADD": 
            return playersAdd(state, action.payload.players);
        case "PLAYERS_REMOVE":
            return playersRemove(state, action.payload.players);
        case "LOGIN_ERROR":
            return loginError(state, action.payload.text);
        case "GAME_START":
            return gameStart(state, action.payload.from, action.payload.white);    
        case "MOVE":
            return moveOther(state, action.payload.moveFrom, action.payload.moveTo, 
                action.payload.piece, action.payload.text, action.payload.takeOnPassage);
        case "RESIGN":
            return sendEndGameMessage(state, action.payload.text, 'X');
        case "DEUCE":
            return sendEndGameMessage(state, 'Deuce', ' deuce');
        case "LOGIN_OK":
            return onLoginOK(state);
        
            
        // TODO
             
        default:
            return state;
    }    
};

const moveOther = (state, moveFrom, moveTo, piece, message, takeOnPassage) => {
    const r = Object.assign({}, state);

    const passage = determinePassage(moveFrom, moveTo);
    r.moveOtherTo = moveTo;
    r.passage = passage;
    let take = isTake(moveTo);
    r.board.moveOther(moveFrom, moveTo, piece);
    if (takeOnPassage) {
        r.board.removePiece(takeOnPassage);
    }
    let check = isCheck(r.board, r.whiteMe);

    // Calculate all moves (TODO refactor):
    const myFigures = r.board.getPieces(true, r.whiteMe);
    var counter = 0;
    for (var i = 0; i < myFigures.length; i++) {
        const moves = new MoveValidator(myFigures[i], r.board).calculateAvailableCells();
        counter += moves.length - 1;
    }

    if (0 === counter) {
        const msgMy = check ? "Checkmate. You loose." : "Stalemate. Deuce.";
        const msgOther = check ? "Your opponent just got checkmate. You win." : "Stalemate. Deuce.";
        const what = check ? "RESIGN" : "DEUCE";
        const suffix = check ? 'X' : ' deuce';

        addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix}, r);
        r.myMove = false;
        r.endGame = true;
        r.message = msgMy;
        r.askResign = false;
        sendGameMessage({type: "AMEND_LAST_MOVE", payload:{text: suffix}});
        sendGameMessage({type: what, payload:{text: msgOther}});

        return r;
    } else if (check) {
        message = "Check";
    }
    const suffix = check ? '+' : undefined;
    sendGameMessage({type: "AMEND_LAST_MOVE", payload: {text: suffix}});
    addMoveToList({moveFrom: moveFrom, moveTo: moveTo, take: take, newType: piece, suffix: suffix}, r);
    r.myMove = true;
    r.message = message;
    r.moveOtherTo = undefined;
    return r;
}

const gameStart = (state, otherPlayer, white) => {
    const r = Object.assign({}, state);
    r.endGame = false;
    r.whiteMe = white;
    r.otherPlayer = otherPlayer;
    r.myMove = white;
    r.board = new BoardData(white);
    r.moves = [];
    r.newPieceType = undefined;
    r.showConversion = false;
    r.moveFrom = undefined;
    return r;
}

const loginError = (state, text) => {
    const r = Object.assign({}, state);
    r.message = text;
    console.log("ERROR", text);
    return r;
}

const playersAdd = (state, players) => {
    if (!state.player) {
        return state;
    }
    const r = Object.assign({}, state);
    const p = [];
    state.waitingPlayers.forEach(i => p.push(i));
    players.forEach(i => {
        if (state.player !== i && !p.includes(i)) {
            p.push(i);
        }
    });
    r.waitingPlayers = p;
    return r;
}

const playersRemove = (state, players) => {
    var p = [];
    state.waitingPlayers.forEach(i => {
        if (state.player !== i && !players.includes(i)) {
            p.push(i);
        }
    });
    const r = Object.assign({}, state);
    r.waitingPlayers = p;
    return r;
}

*/                
