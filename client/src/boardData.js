import MoveValidator from './moveValidator';

function startRow(white) {
  return white ? "1" : "8";
}

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

    this.startRook1 = "c" + startRow(whiteMe) + "1";
    this.startRook8 = "c" + startRow(whiteMe) + "8";
    this.startKing = "c" + startRow(whiteMe) + "5";

    if(src) { this.copyData(src); } else { this.init(); }
    this.availableCells = [];
  }

  get(pos) {
    return this.data[pos];
  }

  doMove(moveFrom, moveTo, type) {
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
    if( moveFrom===this.startRook1 || moveTo===this.startRook1) {
      this.rook1Moved = true;
    }
    if( moveFrom===this.startRook8 || moveTo===this.startRook8) {
      this.rook8Moved = true;
    }
    if( moveFrom===this.startKing || moveTo===this.startKing) {
      this.kingMoved = true;
    }
    // Check for castling:
    if( "king"===type) {
      const xFrom = x(moveFrom);
      const xTo = x(moveTo);
      const yFrom = y(moveTo);
      if( xTo-xFrom===2) {
        this.doMove( "c" + yFrom + "8", "c" + yFrom + "6", "rook");
      }
      if( xFrom-xTo===2) {
        this.doMove( "c" + yFrom + "1", "c" + yFrom + "4", "rook");
      }
    }
  }

  move(moveFrom, moveTo) {
    if( moveFrom===moveTo || !this.availableCells.includes(moveTo)) {
      return false;
    }
    let type = this.get(moveFrom).type;
    this.doMove(moveFrom, moveTo, type);
    return true;
  }

  moveOther(moveFrom, moveTo, type) {
    this.data[moveFrom].type = type;
    this.doMove(moveFrom, moveTo);
  }

  copyData(src) {
    let b = {};
    Object.keys( src.data ).forEach( key => {
      const v = src.data[key];
      b[key] = {type: v.type, white: v.white };
    });
    this.rook1Moved = src.rook1Moved;
    this.rook8Moved = src.rook8Moved;
    this.kingMoved = src.kingMoved;
    this.data = b;
  }

  init() {
    this.rook1Moved = false;
    this.rook8Moved = false;
    this.kingMoved = false
    let b = {};

    let addFigures = white => {
      const y = white ? 1 : 8;
      b["c" + y + "1"] = {type: "rook", white: white};
      b["c" + y + "2"] = {type: "knight", white: white};
      b["c" + y + "3"] = {type: "bishop", white: white};
      b["c" + y + "4"] = {type: "queen", white: white};
      b["c" + y + "5"] = {type: "king", white: white};
      b["c" + y + "6"] = {type: "bishop", white: white};
      b["c" + y + "7"] = {type: "knight", white: white};
      b["c" + y + "8"] = {type: "rook", white: white};
    };
    addFigures(true);
    for( let i=1; i<=8; i++ ) {
      b["c2" + i] = {type: "pawn", white: true};
    }
    addFigures(false);
    for( let i=1; i<=8; i++ ) {
      b["c7" + i] = {type: "pawn", white: false};
    }
    this.data = b;
  }

  clearAvailableCells() {
    this.availableCells = [];
  }

  calculateAvailableCells(src) {
    this.availableCells = new MoveValidator(src, this)
      .calculateAvailableCells();
  }

  isAvailable(c) {
    return this.availableCells.includes(c);
  }

}

function x(key) {
    return parseInt(key.substring(2,3));
}

function y(key) {
    return parseInt(key.substring(1,2));
}
