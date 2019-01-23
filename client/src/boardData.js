import MoveValidator from './moveValidator';

export default class BoardData {

  constructor() {
    this.init = this.init.bind(this);
    this.get = this.get.bind(this);
    this.move = this.move.bind(this);
    this.moveOther = this.moveOther.bind(this);
    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
    this.clearAvailableCells = this.clearAvailableCells.bind(this);
    this.isAvailable = this.isAvailable.bind(this);

    this.data = this.init();
    this.availableCells = [];
  }

  get(pos) {
    return this.data[pos];
  }

  move(moveFrom, moveTo) {
    if( moveFrom===moveTo || !this.availableCells.includes(moveTo)) {
      return false;
    }
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
    return true;
  }

  moveOther(moveFrom, moveTo, type) {
    console.log("1", this.data[moveFrom], type );
    this.data[moveFrom].type = type;
    console.log("2", this.data[moveFrom], type );
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
  }

  init() {
    // Init board:
    var b = {};
    
    var addFigures = white => {
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
    for( var i=1; i<=8; i++ ) {
      b["c2" + i] = {type: "pawn", white: true};
    }
    addFigures(false);
    for( i=1; i<=8; i++ ) {
      b["c7" + i] = {type: "pawn", white: false};
    }
    return b;
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
