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
        // FROM UI:    
        case "UI_OPEN_SESSION":
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
        // FROM WS:
        case "LOGIN_ERROR": 
            return updateState(state, s => loginError(s, action));
        case "PLAYERS_ADD":
            return updateState(state, s => playersAdd(s, action));
        case "PLAYERS_REMOVE":
            return updateState(state, s => playersRemove(s, action));            
        case "GAME_START":
            return updateState(state, s => startGame(s, action, service));  
        case "MOVE":
            return updateState(state, s => move(s, action, service));
        case "RESIGN":
            return updateState(state, s => win(s, action, service)); 
        case "AMEND_LAST_MOVE":
            return updateState(state, s => amendLastMove(s, action, service));                                                
        case "ASK_DEUCE":
            return updateState(state, s => askAcceptDeuce(s, action, service));                                                
        case "DEUCE":
            return updateState(state, s => acceptRemoteDeuce(s, action, service));                                                
        case "LOGIN_OK":
            return updateState(state, s => loginOk(s, action, service));                                                
        default:
            return state;
    }
}

const updateState = (state, updater) => {
    var s = Object.assign({}, state); updater(s); return s;
};

const openSession = (state, service) => {
    const login = UUID.create().toString();        
    service.mediatorClient.startSession( login, service.dispatch);        
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
    amendLastMove(state, {payload:{text:'deuce'}}, service);    
    service.sendGameMessage(state, {type:"DEUCE"});
}

const resign = (state, service) => {
	state.myMove = false; state.endGame = true; state.message = "You lose."; state.askResign = false;
	service.sendGameMessage(state, {type:"RESIGN",  payload:{text:"Your opponent just have resigned. You win."}});
}

const deuce = (state, service) => {
	state.askDeuce = false;
	state.myMove = false;
	service.sendGameMessage(state, {type:"ASK_DEUCE"});
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
    state.moveFrom = action.payload.moveFrom;
    state.board.calculateAvailableCells(action.payload.moveFrom, state.passage)
}

const moveEnd = (state, action, service) => {
    state.myMove = false;
	service.dropPiece(state, action.payload.moveFrom, action.payload.moveTo);	
}

const loginError = (state, action) => { state.message = action.payload.text; };

const playersAdd = (state, action) => {
    if (!state.player) { return; }
    var p = [];
    state.waitingPlayers.forEach(i => p.push(i));
    action.payload.players.forEach(i => {
        if (state.player !== i && !p.includes(i)) { p.push(i); }
    });
    state.waitingPlayers = p;
}
    
const playersRemove = (state, action) => {
    var p = [];
    state.waitingPlayers.forEach(i => {
        if (state.player !== i && !action.payload.players.includes(i)) { p.push(i);}
    });
    state.waitingPlayers = p;
} 

const move = (state, action, service) => {
    state.myMove = true; 
    state.moveOtherTo = action.payload.moveTo;
    
    service.moveOther(state, action.payload.moveFrom, action.payload.moveTo, action.payload.piece,
        action.payload.text, action.payload.takeOnPassage);
} 

const win = (state, action, service) => {
    sendEndGameMessage(state, action.payload.text, 'X', service);
}

const askAcceptDeuce = (state, action, service) => {
    state.myMove = false; state.confirmDeuce = true;
} 

const amendLastMove = (state, action, service) => {
    if (state.moves.length > 0) {
        const suffix = action.payload.text;
        const lastMove = state.moves[state.moves.length - 1];
        const v = state.whiteMe ? lastMove.white : lastMove.black;
        if (v)  { v.suffix = suffix; }
    }
}    

const loginOk = (state, action, service) => {
    state.player = action.payload.from;
} 

const acceptRemoteDeuce = (state, service) => {    
    state.myMove = true; state.confirmDeuce = false; state.endGame = true; state.message = 'Deuce';
    amendLastMove(state, {payload:{text:'deuce'}}, service);
} 

const sendEndGameMessage = (state, msg, suffix, service) => {
    state.myMove = true; state.message = msg; state.endGame = true;
    amendLastMove(state, {payload:{text:suffix}}, service);
}
