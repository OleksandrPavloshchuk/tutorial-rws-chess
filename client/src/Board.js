import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-drag-and-drop';

import './assets/css/board.css';

export default class Board extends Component {

  render() {

    let squares = [];

    let labels = ['a','b','c','d','e','f','g','h'];
    if( !this.props.app.state.whiteMe ) {
        labels = labels.reverse();
    }

    squares.push(<LRow aKey="top" key="top" labels={labels}/>);
    for( var i=1; i<=8; i++ ) {
        const l = this.props.app.state.whiteMe ? 9 - i : i;
        squares.push(<Row label={l} key={i} type={i % 2} app={this.props.app} />);
    }
    squares.push(<LRow aKey="bottom" key="bottom" labels={labels}/>);

    return (
        <div className="card board ">
          <div className="card-body">
            <table>
            <tbody>
            <Player name={this.props.app.state.otherPlayer} />
            {squares}
            <Player name={this.props.app.state.player} />
            </tbody>
            </table>
          </div>
        </div>
    );
  }
}

class Player extends Component {
  render() {
    return (
      <tr><td colSpan="10"><h5 className="card-title text-center">{this.props.name}</h5></td></tr>
    );
  }
}

class LRow extends Component {
  render() {
    return (
      <tr key={this.props.aKey}>
         <td></td>
        {this.props.labels.map( l => <LCell text={l} key={l}/>)}
        <td></td>
      </tr>
    );
  }
}

class Row extends Component {
  render() {
    let cs = [];

    for(var i=1; i<=8; i++ ) {
      const lc = this.props.app.state.whiteMe ? i  : 9 - i;
      const key = 'c' + this.props.label + lc;
      cs.push(
        <Cell key={key} aKey={key} white={(i % 2) !== this.props.type} app={this.props.app} />
      );
    }

    return (
      <tr key={this.props.key}>
        <LCell text={this.props.label} aKey={this.props.label} />
        {cs}
        <LCell text={this.props.label} aKey={this.props.label} />
      </tr>
    );
  }
}

class LCell extends Component {
  render() {
    return (
      <td className="cell-label" key={this.props.aKey}>{this.props.text}</td>
    );
  }
}

class Cell extends Component {

  // TODO (2019/01/19) set allowed drop types in accordance with valid moves

  render() {
    const piece = this.props.app.state.board.get(this.props.aKey);
    const draggable = piece && this.props.app.state.myMove &&
      ((this.props.app.state.whiteMe && piece.white)
      || (!this.props.app.state.whiteMe && !piece.white));

    return (
      <td className={this.props.white ? 'cell-white' : 'cell-black'} key={this.props.aKey}>
      <Droppable types={['piece']} onDrop={key => this.props.app.moveComplete(key, this.props.aKey)} >
      {piece &&
        <Piece white={piece.white} type={piece.type} position={this.props.aKey} draggable={draggable}
          app={this.props.app} />
      }
      {!piece &&
        <div className="cell-empty">&nbsp;</div>
      }
      </Droppable>
      </td>
    );
  }
}

class Piece extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: this.props.position
    };
  }

  render() {
    const color = this.props.white ? "-white" : "-black";

    return (
      this.props.draggable
      ? <Draggable type="piece" data={this.state.position}
          className={this.props.type + color + " piece" }
          onDragStart={val => this.props.app.moveStart(this.state.position)}
        ></Draggable>
      : <div className={this.props.type + color + " piece" }></div>
    );
  }
}
