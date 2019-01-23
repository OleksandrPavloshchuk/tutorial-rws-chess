import MoveValidator from './moveValidator';

export default class BoardData {

  constructor(src) {
    this.init = this.init.bind(this);
    this.get = this.get.bind(this);
    this.move = this.move.bind(this);
    this.moveOther = this.moveOther.bind(this);
    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
    this.clearAvailableCells = this.clearAvailableCells.bind(this);
    this.isAvailable = this.isAvailable.bind(this);

    this.data = src ? this.copyData(src) : this.init();
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
    this.data[moveFrom].type = type;
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
  }

  copyData(src) {
    let b = {};
    Object.keys( src.data ).forEach( key => {
      const v = src.data[key];
      b[key] = {type: v.type, white: v.white };
    });
    return b;
  }

  init() {
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
