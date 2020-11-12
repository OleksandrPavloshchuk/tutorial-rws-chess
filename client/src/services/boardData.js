import MoveValidator from './moveValidator';

export default class BoardData {

    constructor(whiteMe, src) {
        this.init = this.init.bind(this);
        this.get = this.get.bind(this);
        this.move = this.move.bind(this);
        this.moveOther = this.moveOther.bind(this);
        this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
        this.clearAvailableCells = this.clearAvailableCells.bind(this);
        this.isAvailable = this.isAvailable.bind(this);
        this.copyData = this.copyData.bind(this);
        this.init = this.init.bind(this);
        this.doMove = this.doMove.bind(this);
        this.setNewPieceType = this.setNewPieceType.bind(this);
        this.getPieces = this.getPieces.bind(this);
        this.removePiece = this.removePiece.bind(this);
    
        const y = startY(whiteMe);

        this.startRook1 = key(1, y);
        this.startRook8 = key(8, y);
        this.startKing = key(5, y);

        if(src) { this.copyData(src); } else { this.init(); }
        this.availableCells = [];
    }

    removePiece = pos => delete this.data[pos];

    get = pos => this.data[pos];
  
    setNewPieceType = (pos, newType) => { if( newType ) { this.get(pos).type = newType; } };

    doMove(moveFrom, moveTo, type) {
        this.data[moveTo] = this.data[moveFrom];
        delete this.data[moveFrom];
        if( moveFrom===this.startRook1 || moveTo===this.startRook1) { this.rook1Moved = true; }
        if( moveFrom===this.startRook8 || moveTo===this.startRook8) { this.rook8Moved = true; }
        if( moveFrom===this.startKing || moveTo===this.startKing) { this.kingMoved = true; }
        // Check for castling:
        if( "king"===type) {
            const xFrom = x(moveFrom); const xTo = x(moveTo); const yFrom = y(moveTo);
            if( xTo-xFrom===2) { this.doMove( key(8, yFrom), key(6, yFrom), "rook");
            } else if( xFrom-xTo===2) { this.doMove( key(1,yFrom), key(4, yFrom), "rook"); }
        }        
    }

    move(moveFrom, moveTo) {
        if( moveFrom===moveTo || !this.isAvailable(moveTo)) { return false; }
        this.doMove(moveFrom, moveTo, this.get(moveFrom).type);
        return true;
    }

    moveOther(moveFrom, moveTo, type) {
        if(type) { this.data[moveFrom].type = type; }
        this.doMove(moveFrom, moveTo, this.get(moveFrom).type );
    }

    copyData(src) {
        this.data = Object.assign({}, src.data );
        this.rook1Moved = src.rook1Moved;
        this.rook8Moved = src.rook8Moved;
        this.kingMoved = src.kingMoved;
    }

    init() {
        this.rook1Moved = false;
        this.rook8Moved = false;
        this.kingMoved = false
        let b = {};

        let addFigures = white => {
            const y = startY(white);
            b[key(1,y)] = {type: "rook", white: white};
            b[key(2,y)] = {type: "knight", white: white};
            b[key(3,y)] = {type: "bishop", white: white};
            b[key(4,y)] = {type: "queen", white: white};
            b[key(5,y)] = {type: "king", white: white};
            b[key(6,y)] = {type: "bishop", white: white};
            b[key(7,y)] = {type: "knight", white: white};
            b[key(8,y)] = {type: "rook", white: white};
        };
        addFigures(true);
        for( let i=1; i<=8; i++ ) { b[key(i,2)] = {type: "pawn", white: true}; }
        addFigures(false);
        for( let i=1; i<=8; i++ ) { b[key(i,7)] = {type: "pawn", white: false}; }
        this.data = b;
    }

    clearAvailableCells = () => { this.availableCells = []; };
    calculateAvailableCells = (src, passage) => { this.availableCells = new MoveValidator(src, this, passage).calculateAvailableCells(); };
    isAvailable = c => this.availableCells.includes(c);

    getPieces(my, whiteMe) {
        let r = [];
        Object.keys(this.data).forEach( k => {
            const p = this.data[k];
            if( ( my && p.white===whiteMe ) || ( !my && p.white!==whiteMe ) ) { r.push(k); }
        });
        return r;
    }

}

export function key(x,y) { return "c" + y + x; }
export function x(key) { return parseInt(key.substring(2,3)); }
export function y(key) { return parseInt(key.substring(1,2)); }
export function startY(white) { return white ? 1 : 8; }
