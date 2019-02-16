import {key, x, y} from './boardData';

export default class CheckDetector {

    constructor(src, board) {
        this.src = src; this.x = x(src); this.y = y(src);
        this.board = board; this.piece = this.board.get(this.src);

        this.checkDetector = {
        pawn : () => {
            const step = this.piece.white ? 1 : -1;
            return this.checkCell(this.x-1, this.y+step) || this.checkCell(this.x+1, this.y+step);
        },
        knight : () => this.checkCell(this.x+1, this.y+2)
            || this.checkCell(this.x+2, this.y+1)
            || this.checkCell(this.x-1, this.y-2)
            || this.checkCell(this.x-2, this.y-1)
            || this.checkCell(this.x+1, this.y-2)
            || this.checkCell(this.x-2, this.y+1)
            || this.checkCell(this.x-1, this.y+2)
            || this.checkCell(this.x+2, this.y-1),
        bishop : () => this.checkSeries(i => this.x+i, i => this.y+i)
            || this.checkSeries(i => this.x-i, i => this.y-i)
            || this.checkSeries(i => this.x+i, i => this.y-i)
            || this.checkSeries(i => this.x-i, i => this.y+i),
        rook : () => this.checkSeries(i => this.x, i => this.y+i)
            || this.checkSeries(i => this.x, i => this.y-i)
            || this.checkSeries(i => this.x+i, i => this.y)
            || this.checkSeries(i => this.x-i, i => this.y),
        queen : () => this.checkDetector['rook']() || this.checkDetector['bishop'](),
        king : () => false
        };

        this.isCheck = this.isCheck.bind(this);
        this.checkCell = this.checkCell.bind(this);
        this.checkSeries = this.checkSeries.bind(this);
    }

    isCheck = () => this.piece ? this.checkDetector[this.piece.type]() : false;

    /**
     * @return null - no check and exit from loop
             false - no check and continue loop 
             true - check is detected
     */
    checkCell(x, y) {
        if(!valid(x) || !valid(y)) { return null; }
        const p = this.board.get(key(x,y));
        if(!p) { return false; }
        if( p.white===this.piece.white ) { return null; }
        return ("king"===p.type) ? true : null;
    }

    checkSeries(nextX, nextY) {
        for(let i=1; i<8; i++) {
            const x = nextX(i); const y = nextY(i); const v = this.checkCell(x, y);
            if( v==null ) { return false; } if(v) { return true; }
        }
        return false;
    }
}

function valid(v) { return 1<=v && 8>=v; }
