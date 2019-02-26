import { createStore } from 'redux';
import gameReducer from './gameReducer';

export default function configureStore(state = {
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
    useDragAndDrop: detectUseDragAndDrop()
}) {
    return createStore(gameReducer, state);
}

function detectUseDragAndDrop() {
	let platform = window.navigator.platform.toUpperCase();    
	return !platform.includes("IPHONE") && !platform.includes("ANDROID");
}
