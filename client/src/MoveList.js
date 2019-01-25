import React, { Component } from 'react';

export default class MoveList extends Component {

  constructor(props) {
    super(props);

    this.label = this.label.bind(this);
    this.labelPos = this.labelPos.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  labelPos(src) {
    const x = src.substring(2,3);
    const y = src.substring(1,2);
    return colLabels[x] + y;
  }

  label(m) {
    // TODO (2019/01/23) use check / mate tag
    if( m.castling ) {
      return m.castling;
    }
    var r = m.newType ? "" : pieceLabels[m.piece];
    r += this.labelPos(m.moveFrom) + (m.take ? ':' : '-') + this.labelPos(m.moveTo);
    r += m.newType ? pieceLabels[m.piece] : "";
    return r;
  }

  renderRow(m) {
      if( m.message ) {
        return null;
      } else {
        return <tr key={"m" + m.num}>
          <th scope="row">{m.num}</th>
          <td>{this.label(m.white)}</td>
          {m.black && <td>{this.label(m.black)}</td> }
          {!m.black && <td></td>}
        </tr>
      }
  }

  render() {
    return (
        <div className="card move-list">
          <h5 className="card-header">Moves</h5>
          <div className="card-body">
            <table className="table small">
              <tbody>
              {this.props.app.state.moves.map( m => this.renderRow(m))}
              </tbody>
            </table>
          </div>
        </div>
    );
  }
}

const pieceLabels = {
  "pawn": "", "rook": "R", "knight": "N",
  "bishop": "B", "queen": "Q", "king": "K"
};
const colLabels = {
  "1":"a", "2":"b", "3":"c", "4":"d",
  "5":"e", "6":"f", "7":"g", "8":"h",
};
