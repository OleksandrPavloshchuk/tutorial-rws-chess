// TODO migrate from gameService to react-redux

import UUID from 'uuid-js';
import BoardData, {key, startY, y, x} from './boardData';
import MoveValidator, {isCheck} from './moveValidator';

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
    useDragAndDrop: undefined
};

// TODO gameService is temporary. remove it
export default ( state = initialState, action, service ) => {
    switch (action.type) {
        case "OPEN_SESSION":
            return updateState(state, s => openSession(s, service));
        case "UI_RETRIEVE_PLAYERS":
            return updateState(state, s => retrievePlayers(s, service));            
        case "UI_START_GAME":
            return updateState(state, s => startGameMe(s, action, service));            
        default:
            return state;
    }
}

const updateState = (state, updater) => {
    var s = Object.assign({}, state); updater(s); return s;
};

const openSession = (state, service) => {
    const login = UUID.create().toString();        
    service.mediatorClient.startSession( login, '', {
        "LOGIN_ERROR": msg => { state.message = msg.payload.text; },
        "PLAYERS_ADD": msg => service.playersAdd(msg.payload.players),
        "PLAYERS_REMOVE": msg => service.playersRemove(msg.payload.players),
        "GAME_START": msg => service.startGame( msg.payload.from, msg.payload.white),
        "MOVE": msg => service.moveOther(msg.payload.moveFrom, msg.payload.moveTo, msg.payload.piece,
             msg.payload.text, msg.payload.takeOnPassage),
        "RESIGN": msg => service.win(msg.payload.text),
        "AMEND_LAST_MOVE": msg => service.amendLastMove(msg.payload.text),
        "ASK_DEUCE": () => service.onAskDeuce(),
        "DEUCE": () => service.deuce(),
        "LOGIN_OK": () => service.setPlayer(login)
        }
    );        
};

const retrievePlayers = (state, service) => {
    service.mediatorClient.sendGameMessage({type:"ASK_PLAYERS" });    
};

const startGameMe = (state, action, service) => {
    service.mediatorClient.startGame(state.player, action.payload.from, !action.payload.white);
    startGame(state, action, service);
}

const startGame = (state, action, service) => {
    state.endGame = false;
    state.whiteMe = action.payload.white;
    state.otherPlayer = action.payload.from;
    state.myMove = action.payload.white;
    state.board = new BoardData(action.payload.white);
    state.moves = [];
    state.newPieceType = undefined;
    state.showConversion = false;
    state.moveFrom = undefined;
}
