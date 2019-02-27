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
        case "UI_LOGOUT":
            return updateState(state, s => logout(s, service)); 
        case "UI_ACCEPT_DEUCE":
            return updateState(state, s => acceptDeuce(s, service));  
		case "UI_RESIGN":
            return updateState(state, s => resign(s, service)); 
		case "UI_DEUCE":
            return updateState(state, s => deuce(s, service));                      
		case "UI_CANCEL":
            return updateState(state, s => cancel(s, service));                      
		case "UI_ASK_RESIGN":
            return updateState(state, s => askResign(s, service));  
		case "UI_ASK_DEUCE":
            return updateState(state, s => askDeuce(s, service)); 
		case "UI_END_GAME":
            return updateState(state, s => endGame(s, service));                   
		case "UI_MOVE_START":
            return updateState(state, s => moveStart(s, action, service));   
		case "UI_MOVE_END":
            return updateState(state, s => moveEnd(s, action, service));                  
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

const logout = (state, service) => {
    service.mediatorClient.logout(state.player);
    state.player = undefined;
}

const acceptDeuce = (state, service) => {    
    state.myMove = true; state.confirmDeuce = false; state.endGame = true; state.message = 'Deuce';
    service.amendLastMove('deuce');
    service.sendGameMessage({type:"DEUCE"});
}

const resign = (state, service) => {
	state.myMove = false; state.endGame = true; state.message = "You lose."; state.askResign = false;
	service.sendGameMessage({type:"RESIGN",  payload:{text:"Your opponent just have resigned. You win."}});
}

const deuce = (state, service) => {
	state.askDeuce = false;
	service.sendGameMessage({type:"ASK_DEUCE"});
}

const cancel = (state, service) => {
	state.askResign = false;
	state.askDeuce = false;
	state.confirmDeuce = false;
}

const askResign = (state, service) => {
	state.askResign = true;
	state.acceptDeuce = false;
	state.askDeuce = false;
	state.confirmDeuce = false;
}

const askDeuce = (state, service) => {
	state.askResign = false;
	state.acceptDeuce = false;
	state.askDeuce = true;
	state.confirmDeuce = false;
}

const endGame = (state, service) => {
	state.otherPlayer = undefined;
    state.whiteMe = undefined;
    state.myMove = undefined;
    state.endGame = false;
    state.message = undefined;
    state.board = undefined;
    state.moveFrom = undefined;
}

const moveStart = (state, action, service) => {
	service.moveStart(action.payload.moveFrom);	
}

const moveEnd = (state, action, service) => {
	service.dropPiece(action.payload.moveFrom, action.payload.moveTo);	
}
