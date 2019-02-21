export default function getPieceStyle(cellSize, piece, white) {
    const s =  cellSize + 'px';
    const bs = (cellSize * 6) + 'px ' + (cellSize * 2) + 'px ';
    const offsetX = backgroundOffsets[piece] * cellSize;
    const offsetY =  white ? 0 : cellSize;
    return {
        backgroundSize: bs, 
        backgroundPosition: offsetX + 'px ' + offsetY + 'px',
        width: s, height: s            
    };
}

const backgroundOffsets = {
	king: 0.0, queen: 5.0, bishop: 4.0, knight: 3.0, rook: 2.0, pawn: 1.0
}


