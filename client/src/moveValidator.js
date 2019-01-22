export default class MoveValidator {

  constructor(src, board) {
    this.src = src;
    this.x = parseInt(src.substring(2,3));
    this.y = parseInt(src.substring(1,2));
    this.board = board;

    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
  }

  calculateAvailableCells() {
    const piece = this.board.get(this.src);
    if( !piece ) {
      return [];
    }
    let r = pieceValidators[piece.type](this.board, this.x, this.y, piece.white);
    r.push(this.src);
    // TODO validate for opening the king
    return r;
  }

}

function valid(v) {
  return 1<=v && 8>=v;
}

const pieceValidators = {
    pawn : (board,x,y,white) => {
      let r = [];
      if(white) {
        if( checkPawn(r,board,white,x,y+1) && y===2) {
          checkPawn(r,board,white,x,y+2);
        }
      } else {
        if( checkPawn(r,board,white,x,y-1) && y===7) {
          checkPawn(r,board,white,x,y-2);
        }
      }
      // TODO take
      // TODO take on passage
      return r;
    },
    knight : (board,x,y,white) => {
      let r = [];
      check(r,board,white,x+1,y+2);
      check(r,board,white,x+2,y+1);
      check(r,board,white,x-1,y-2);
      check(r,board,white,x-2,y-1);
      check(r,board,white,x+1,y-2);
      check(r,board,white,x-2,y+1);
      check(r,board,white,x-1,y+2);
      check(r,board,white,x+2,y-1);
      return r;
    },
    bishop : (board,sx,sy,white) => {
      let r = [];
      checkSeries(r, board, white, sx, sy,
        (x,i) => x+i, (y,i) => y+i);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x-i, (y,i) => y-i);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x+i, (y,i) => y-i);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x-i, (y,i) => y+i);
      return r;
    },
    rook : (board,sx,sy,white) => {
      let r = [];
      checkSeries(r, board, white, sx, sy,
        (x,i) => x, (y,i) => y+i);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x, (y,i) => y-i);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x+i, (y,i) => y);
      checkSeries(r, board, white, sx, sy,
        (x,i) => x-i, (y,i) => y);
      return r;
    },
    queen : (board,sx,sy,white) => {
      return pieceValidators['rook'](board,sx,sy,white).concat(
        pieceValidators['bishop'](board,sx,sy,white)
      );
    },
    king : (board,x,y,white) => {
      let r = [];
      check(r,board,white,x,y+1);
      check(r,board,white,x,y-1);
      check(r,board,white,x+1,y);
      check(r,board,white,x-1,y);
      check(r,board,white,x+1,y+1);
      check(r,board,white,x-1,y-1);
      check(r,board,white,x-1,y+1);
      check(r,board,white,x+1,y-1);
      return r;
    }
};

/**
 * @return null - do not add this key to avaibale and exit from loop
           false - add this key to available and exit from loop
           true - add this key to avaiable and continue loop
 */
function checkCell(board, white, x, y) {
  if(!valid(x) || !valid(y)) {
    return null;
  }
  const p = board.get("c"+y+x);
  if(!p) {
    return true;
  }
  return p.white===white ? null : false;
}

function check(result, board, white, x, y) {
  if(null!=checkCell(board, white, x, y)) {
    result.push("c" + y + x);
  }
}

function checkPawn(result, board, white, x, y) {
  var v = checkCell(board, white, x, y);
  if(checkCell(board, white, x, y)) {
    result.push("c" + y + x);
    return true;
  }
  return false;
}

function checkSeries(result, board, white, sx, sy, nextX, nextY) {
  for(let i=1; i<8; i++) {
    let x = nextX(sx, i);
    let y = nextY(sy, i);
    let v = checkCell(board, white, x, y);
    if(v==null) {
      return;
    }
    result.push("c" + y + x);
    if(!v) {
      return;
    }
  }
}
