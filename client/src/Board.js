import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-drag-and-drop';
import {Motion, spring} from 'react-motion';

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
        {this.props.labels.map( l => <LCell text={l} key={l} aKey={l}/>)}
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
        <td className="cell-label">{this.props.label}</td>
        {cs}
        <td className="cell-label">{this.props.label}</td>
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

  render() {
    const piece = this.props.app.state.board.get(this.props.aKey);
    const draggable = piece 
      && this.props.app.state.myMove 
      && !this.props.app.state.showConversion 
      && !this.props.app.state.endGame
      && ((this.props.app.state.whiteMe && piece.white)
      || (!this.props.app.state.whiteMe && !piece.white));

    const cellIsAvailable = this.props.app.state.board.isAvailable(this.props.aKey);

    return (
      <td className={'cell-' + (this.props.white ? 'white' : 'black') + (cellIsAvailable ? ' cell-available' : '') } key={this.props.aKey}>
      <Droppable types={['piece']} onDrop={key => this.props.app.dropPiece(key, this.props.aKey)} >
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

  render() {
    const color = this.props.white ? "-white" : "-black";
    const moveThis = this.props.postion===this.props.app.state.otherMoveTo;

    return (
      this.props.draggable
      ?
       <Draggable type="piece" data={this.props.position} className={this.props.type + color + " piece" }
          onDragStart={val => this.props.app.moveStart(this.props.position)}>     
          <Motion defaultStyle={{opacity:1}} style={{opacity: spring(moveThis ? 1 : 0)}}>{
          style => <div style={{opacity:style.opacity}} className="piece"></div>
          }</Motion>
          </Draggable>
      : <div className={this.props.type + color + " piece" }></div>
    );
  }
}
