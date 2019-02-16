import BoardData, {key, x, y} from './boardData';
import CheckDetector from './checkDetector';

export default class MoveValidator {

    constructor(src, board, passage) {
        this.src = src; this.x = x(src); this.y = y(src);
        this.board = board; this.piece = this.board.get(this.src);
        this.passage = passage;

        this.pieceValidators = {
        pawn : () => { let r = [];
            const step = this.piece.white ? 1 : -1;
            const startLine = this.piece.white ? 2 : 7;

            if( this.checkPawn(r, this.x, this.y+step) && this.y===startLine) {
                this.checkPawn(r, this.x, this.y+2*step);
            }
            this.checkPawnTake(r, this.x-1, this.y+step);
            this.checkPawnTake(r, this.x+1, this.y+step);

            if( this.passage ) {
		        const passX = x(this.passage); const passY = y(this.passage);
                if( ( passX===this.x-1 || passX===this.x+1 ) && passY===this.y) {
                    add( r, passX, passY+step );
                }
            }
            return r;
        },
        knight : () => { let r = [];
            this.check(r, this.x+1, this.y+2);
            this.check(r, this.x+2, this.y+1);
            this.check(r, this.x-1, this.y-2);
            this.check(r, this.x-2, this.y-1);
            this.check(r, this.x+1, this.y-2);
            this.check(r, this.x-2, this.y+1);
            this.check(r, this.x-1, this.y+2);
            this.check(r, this.x+2, this.y-1);
            return r;
        },
        bishop : () => { let r = [];
            this.checkSeries(r, i => this.x+i, i => this.y+i);
            this.checkSeries(r, i => this.x-i, i => this.y-i);
            this.checkSeries(r, i => this.x+i, i => this.y-i);
            this.checkSeries(r, i => this.x-i, i => this.y+i);
            return r;
        },
        rook : () => { let r = [];
            this.checkSeries(r, i => this.x, i => this.y+i);
            this.checkSeries(r, i => this.x, i => this.y-i);
            this.checkSeries(r, i => this.x+i, i => this.y);
            this.checkSeries(r, i => this.x-i, i => this.y);
            return r;
        },
        queen : () => this.pieceValidators['rook']().concat(this.pieceValidators['bishop']()),
        king : () => { let r = [];
            this.check(r, this.x, this.y+1);
            this.check(r, this.x, this.y-1);
            this.check(r, this.x+1, this.y);
            this.check(r, this.x-1, this.y);
            this.check(r, this.x+1, this.y+1);
            this.check(r, this.x-1, this.y-1);
            this.check(r, this.x-1, this.y+1);
            this.check(r, this.x+1, this.y-1);
            if( this.allowedShortCastling() ) { add(r, this.x+2, this.y); }
            if( this.allowedLongCastling() ) { add(r, this.x-2, this.y); }
            return r;
        }};

        this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
        this.checkCell = this.checkCell.bind(this);
        this.check = this.check.bind(this);
        this.checkPawn = this.checkPawn.bind(this);
        this.checkPawnTake = this.checkPawnTake.bind(this);
        this.checkSeries = this.checkSeries.bind(this);
        this.allowedShortCastling = this.allowedShortCastling.bind(this);
        this.allowedLongCastling = this.allowedLongCastling.bind(this);
        this.testCastlingForCheck = this.testCastlingForCheck.bind(this);
    }

    allowedLongCastling() {
        const result = !this.board.kingMoved && !this.board.rook1Moved
            && !this.board.get(key(this.x-1,this.y))
            && !this.board.get(key(this.x-2,this.y))
            && !this.board.get(key(this.x-3,this.y));
        if( !result ) { return false; }    
        return this.testCastlingForCheck(-1, 3);
    }

    allowedShortCastling() {
        const result = !this.board.kingMoved && !this.board.rook8Moved
            && !this.board.get(key(this.x+1,this.y))
            && !this.board.get(key(this.x+2,this.y));
        if( !result ) { return false; }
        return this.testCastlingForCheck(1, 7);
    }
    
    testCastlingForCheck(step,lastX) {
        const y = this.piece.white ? 1 : 8;
        if( isCheck(this.board, this.piece.white) ) { return false; }
        for( var x=5+step; x<=lastX; x += step ) {
            const probeBoard = new BoardData(this.piece.white, this.board);
            probeBoard.doMove(this.src, key(x,y), this.piece.type);
            if ( isCheck(probeBoard, this.piece.white) ) { return false; }
        }
        return true;
    }

    calculateAvailableCells() {
        if( !this.piece ) { return []; }

        let tmp = this.pieceValidators[this.piece.type]();

        let r = [];
        tmp.forEach( k => {
            const probeBoard = new BoardData(this.piece.white, this.board);
            probeBoard.doMove(this.src, k, this.piece.type);
            if (!isCheck(probeBoard, this.piece.white) ) { r.push(k);  }
        });    
        r.push(this.src);
        return r;
    }

    /**
     * @return null - do not add this key to list of available and exit from loop
             false - add this key to list of available and exit from loop
             true - add this key to list of avaiable and continue loop
     */
    checkCell(x, y) {
        if(!valid(x) || !valid(y)) { return null; }
        const p = this.board.get(key(x,y));
        if(!p) { return true; }
        return p.white===this.piece.white ? null : false;
    }

    check(result, x, y) {
        if(null!=this.checkCell(x, y)) { add( result, x, y ); }
    }

    checkPawn(result, x, y) {
        if(this.checkCell(x, y)) { add( result, x, y ); return true; }
        return false;
    }

    checkPawnTake(result, x, y) {
        const v = this.checkCell(x, y); if( null!=v && !v ) { add( result, x, y ); }
    }

    checkSeries(result, nextX, nextY) {
        for(let i=1; i<8; i++) {
            const x = nextX(i); const y = nextY(i); const v = this.checkCell(x, y);
            if( v==null ) { return; }
            add( result, x, y );
            if( !v ) { return; }
        }
    }
}

function valid(v) { return 1<=v && 8>=v; }
function add(r, x, y) { r.push( key( x, y ) ); }

export function isCheck(board, white) {
    const opponentPieces = board.getPieces(false, white);

    for( var i=0; i<opponentPieces.length; i++ ) {
        if( new CheckDetector(opponentPieces[i], board).isCheck() ) { return true; }
    }
    return false;   
}


