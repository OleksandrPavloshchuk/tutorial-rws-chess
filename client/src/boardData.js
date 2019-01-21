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

  moveOther(moveFrom, moveTo) {
    this.data[moveTo] = this.data[moveFrom];
    delete this.data[moveFrom];
    return true;
  }


  init() {
    // Init board:
    var b = {};

    b["c11"] = {type: "rook", white: true};
    b["c12"] = {type: "knight", white: true};
    b["c13"] = {type: "bishop", white: true};
    b["c14"] = {type: "queen", white: true};
    b["c15"] = {type: "king", white: true};
    b["c16"] = {type: "bishop", white: true};
    b["c17"] = {type: "knight", white: true};
    b["c18"] = {type: "rook", white: true};
    for( var i=1; i<=8; i++ ) {
      b["c2" + i] = {type: "pawn", white: true};
    }
    b["c81"] = {type: "rook", white: false};
    b["c82"] = {type: "knight", white: false};
    b["c83"] = {type: "bishop", white: false};
    b["c84"] = {type: "queen", white: false};
    b["c85"] = {type: "king", white: false};
    b["c86"] = {type: "bishop", white: false};
    b["c87"] = {type: "knight", white: false};
    b["c88"] = {type: "rook", white: false};
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
