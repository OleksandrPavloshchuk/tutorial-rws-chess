export default class MoveValidator {

  constructor(src, board) {
    this.src = src;
    this.x = parseInt(src.substring(2,3));
    this.y = parseInt(src.substring(1,2));
    this.board = board;

    this.calculateAvailableCells = this.calculateAvailableCells.bind(this);
    this.isAvailableForRook = this.isAvailableForRook.bind(this);
  }

  calculateAvailableCells() {
    let r = [];
    const piece = this.board.get(this.src);
    if( !piece ) {
      return r;
    }

    for( let x=1; x<=8; x++ ) {
      for( let y=1; y<=8; y++ ) {
        const key = "c" + y + x;
        if( key===this.src) {
          r.push(key);
        } else {
          const otherPiece = this.board.get(key);
          if( otherPiece ) {
            // Check the side:
            if( otherPiece.white!==piece.white ) {
              // TODO check for take depending on piece type
            }
          } else {
            // TODO Check for move depending on piece type
            if( this.isAvailableForRook(x, y) ) {
              r.push(key);
            }
          }
        }
      }
    }
    return r;
  }

  isAvailableForRook(ax, ay) {
    return ax===this.x || ay===this.y;
  }

}
