import MediatorClient from '../services/mediatorClientService';
import BoardData, {key, startY, y, x} from '../services/boardData';
import MoveValidator, {isCheck} from '../services/moveValidator';
import UUID from 'uuid-js';

const mediatorClient = new MediatorClient();

export default (state, action) => {
    switch (action.type) {
        case "PLAYERS_ADD": 
            return playersAdd(state, action.payload.players);
        case "PLAYERS_REMOVE":
            return playersRemove(state, action.payload.players);
        case "LOGIN_ERROR":
            return loginError(state, action.payload.text);
            
        // TODO
             
        default:
            return state;
    }    
};

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

/*
                "GAME_START": msg => this.startGame(msg.payload.from, msg.payload.white),
                "MOVE": msg => this.moveOther(msg.payload.moveFrom, msg.payload.moveTo, msg.payload.piece,
                     msg.payload.text, msg.payload.takeOnPassage),
                "RESIGN": msg => this.win(msg.payload.text),
                "AMEND_LAST_MOVE": msg => this.amendLastMove(msg.payload.text),
                "ASK_DEUCE": () => this.onAskDeuce(),
                "DEUCE": () => this.deuce(),
                "LOGIN_OK": () => this.setPlayer(login)
*/                
