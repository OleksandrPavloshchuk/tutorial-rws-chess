import MediatorClient from './mediatorClientService';
import {key, startY, y, x} from './boardData';
import MoveValidator, {isCheck} from './moveValidator';
import reducer from './reducer';

export default class GameService {

    constructor(component) {
        this.component = component;
        this.mediatorClient = new MediatorClient();

        this.moveComplete = this.moveComplete.bind(this);
        this.moveOther = this.moveOther.bind(this);
        this.addMoveToList = this.addMoveToList.bind(this);
        this.isTake = this.isTake.bind(this);
        this.dropPiece = this.dropPiece.bind(this);
        this.isCastling = this.isCastling.bind(this);
        this.isConversion = this.isConversion.bind(this);
        this.isConfirm = this.isConfirm.bind(this);
        this.sendGameMessage = this.sendGameMessage.bind(this);
        this.determinePassage = this.determinePassage.bind(this);
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
        if( cellSize > baseSize ) { cellSize = baseSize; }
        this.setState({ useDragAndDrop: detectUseDragAndDrop(), cellSize });
    }

    sendGameMessage(state, m) {
        if(!m.payload) { m.payload = {}; }
        m.payload.from = state.player; m.payload.to = state.otherPlayer;
        this.mediatorClient.sendGameMessage(m);
    }

    isTake = (state, moveTo) => !!state.board.get(moveTo)

    isConfirm = () => {
        const state = this.getState();
        return state.askResign || state.confirmDeuce || state.askDeuce;
    }

    moveComplete(state, moveFrom, moveTo, take, newPieceType, takeOnPassage) {
        this.addMoveToList(state, {moveFrom: moveFrom, moveTo: moveTo, take: take, newType: newPieceType});
        state.board.setNewPieceType(moveTo, newPieceType);
        this.sendGameMessage(state, {type: "MOVE", payload:{ moveFrom, moveTo, piece: newPieceType, takeOnPassage } });
        state.myMove = false; state.moveFrom = undefined;
    }

    isConversion(state, moveTo) {
        let p = state.board.get(moveTo);
        if ("pawn" !== p.type) { return false; }
        const lastLine = state.whiteMe ? 8 : 1;
        return lastLine === y(moveTo);
    }

    dropPiece(state, moveFrom, moveTo) {
        var take = this.isTake(state, moveTo);
        if (state.board.move(moveFrom, moveTo)) {
            const step = state.whiteMe ? 1 : -1;
            const pawnKey = key(x(moveTo), y(moveTo) - step);

            var takeOnPassage = undefined;
            if (state.passage === pawnKey) {
                take = this.isTake(state, pawnKey);
                state.board.removePiece(pawnKey);
                takeOnPassage = pawnKey;
            }
            if (this.isConversion(state, moveTo)) {
                state.take = true; state.moveFrom = moveFrom; state.moveTo = moveTo;
                state.showConversion = true;
            } else {
                this.moveComplete(state, moveFrom, moveTo, take, undefined, takeOnPassage);
            }
        }
        state.board.clearAvailableCells();
    }

    determinePassage(state, moveFrom, moveTo) {
        const piece = state.board.get(moveFrom);
        if (!piece) { return undefined; }
        if ("pawn" !== piece.type) { return undefined; }
        const yFrom = y(moveFrom);
        const yTo = y(moveTo);
        if (2 !== Math.abs(yFrom - yTo)) { return undefined; }
        return moveTo;
    }

    moveOther(state, moveFrom, moveTo, piece, message, takeOnPassage) {
        state.passage = this.determinePassage(state, moveFrom, moveTo);
        state.moveOtherTo = moveTo;
        let take = this.isTake(state, moveTo);
        state.board.moveOther(moveFrom, moveTo, piece);
        if (takeOnPassage) {
            state.board.removePiece(takeOnPassage);
        }
        let check = isCheck(state.board, state.whiteMe);

        // Calculate all moves (TODO refactor):
        const myFigures = state.board.getPieces(true, state.whiteMe);
        var counter = 0;
        for (var i = 0; i < myFigures.length; i++) {
            const moves = new MoveValidator(myFigures[i], state.board).calculateAvailableCells();
            counter += moves.length - 1;
        }

        if (0 === counter) {
            const msgMy = check ? "Checkmate. You loose." : "Stalemate. Deuce.";
            const msgOther = check ? "Your opponent just got checkmate. You win." : "Stalemate. Deuce.";
            const what = check ? "RESIGN" : "DEUCE";
            const suffix = check ? 'X' : ' deuce';

            this.addMoveToList(state, {moveFrom, moveTo, take, newType: piece, suffix});
            state.myMove = false; state.endGame = true; state.message = msgMy; state.askResign = false;
            this.sendGameMessage(state, {type: "AMEND_LAST_MOVE", payload:{text: suffix}});
            this.sendGameMessage(state, {type: what, payload:{text: msgOther}});

            return;
        } else if (check) {
            message = "Check";
        }
        const suffix = check ? '+' : undefined;
        this.sendGameMessage(state, {type: "AMEND_LAST_MOVE", payload: {text: suffix}});
        this.addMoveToList(state, {moveFrom, moveTo, take, newType: piece, suffix});
        state.myMove = true; state.message = message; state.moveOtherTo = undefined;
    }

    addMoveToList(state, v) {
        let p = state.board.get(v.moveTo);
        v.piece = p.type;
        let moves = this.getState().moves;
        if (p.white) {
            moves.push({num: state.moves.length + 1, white: v});
        } else {
            moves[state.moves.length - 1].black = v;
        }
        if (this.isCastling(p, v.moveFrom, v.moveTo, 3)) {
            v.castling = "0-0-0";
        } else if (this.isCastling(p, v.moveFrom, v.moveTo, 7)) {
            v.castling = "0-0";
        }
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
}

function detectUseDragAndDrop() {
	let platform = window.navigator.platform.toUpperCase();
	return !platform.includes("IPHONE") && !platform.includes("ANDROID");
}

const baseSize = 45;
