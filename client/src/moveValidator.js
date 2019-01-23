export default class MoveValidator {

  constructor(src, board) {
    this.src = src;
    this.x = parseInt(src.substring(2,3));
    this.y = parseInt(src.substring(1,2));
    this.board = board;
    this.piece = this.board.get(this.src);
    
    this.pieceValidators = {
      pawn : () => { let r = [];
        if(this.piece.white) {
          if( this.checkPawn(r, this.x, this.y+1) && this.y===2) {
            this.checkPawn(r, this.x, this.y+2);
          }
          this.checkPawnTake(r, this.x-1, this.y+1);
          this.checkPawnTake(r, this.x+1, this.y+1);
          // TODO take on passage
        } else {
          if( this.checkPawn(r, this.x, this.y-1) && this.y===7) {
            this.checkPawn(r, this.x, this.y-2);
          }
          this.checkPawnTake(r, this.x-1, this.y-1);
          this.checkPawnTake(r, this.x+1, this.y-1);
          // TODO take on passage
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
        return r;
      }
    };
    
    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
    this.checkCell = this.checkCell.bind(this);
    this.check = this.check.bind(this);
    this.checkPawn = this.checkPawn.bind(this);
    this.checkPawnTake = this.checkPawnTake.bind(this);
    this.checkSeries = this.checkSeries.bind(this);
  }

  calculateAvailableCells() {
    if( !this.piece ) {
      return [];
    }
    
    let r = this.pieceValidators[this.piece.type]();
    r.push(this.src);
    // TODO validate for opening the king
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
    const v = this.checkCell(x, y);
    if( null!=v && !v ) { add( result, x, y ); } 
  }  

  checkSeries(result, nextX, nextY) {
    for(let i=1; i<8; i++) {
      const x = nextX(i);
      const y = nextY(i);
      const v = this.checkCell(x, y);
      if( v==null ) { return; }
      add( result, x, y );
      if( !v ) { return; }
    }
  }
}

function valid(v) { return 1<=v && 8>=v; }
function key(x, y) { return "c" + y + x; }
function add(r, x, y) { r.push( key( x, y ) ); }
