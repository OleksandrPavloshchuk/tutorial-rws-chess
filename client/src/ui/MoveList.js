import React, { Component } from 'react';

export default class MoveList extends Component {

    constructor(props) {
        super(props);

        this.label = this.label.bind(this);
        this.labelPos = this.labelPos.bind(this);
        this.renderRow = this.renderRow.bind(this);
    }

    labelPos = src =>  colLabels[src.substring(2,3)] + src.substring(1,2);

    label = m => {
        if( m.castling ) { return m.castling; }
        var r = m.newType ? "" : pieceLabels[m.piece];
        r += this.labelPos(m.moveFrom) + (m.take ? ':' : '-') + this.labelPos(m.moveTo);
        r += m.newType ? pieceLabels[m.newType] : "";
        if(m.suffix) { r += m.suffix; }
        return r;
    }

    renderRow = m => <tr key={"m" + m.num}><th scope="row">{m.num}</th>
            <td>{this.label(m.white)}</td>
            {m.black
            ? (<td>{this.label(m.black)}</td>)
            : (<td></td>)}
        </tr>

  render = () => <div className="card move-list">
          <h5 className="card-header">Moves</h5>
          <div className="card-body move-list-body">
              <table className="table small">
                  <tbody>
                      {this.props.app.getState().moves.map( m => this.renderRow(m))}
                  </tbody>
              </table>
        </div>
    </div>;
}

const pieceLabels = { "pawn": "", "rook": "R", "knight": "N", "bishop": "B", "queen": "Q", "king": "K" };
const colLabels = { "1":"a", "2":"b", "3":"c", "4":"d", "5":"e", "6":"f", "7":"g", "8":"h" };
