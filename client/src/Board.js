import React, { Component } from 'react';

import './assets/css/board.css';

export default class Board extends Component {

  render() {

    let squares = [];

    let labels = ['', 'a','b','c','d','e','f','g','h', ' '];
    if( !this.props.app.state.whiteMe ) {
        labels = labels.reverse();
    }

    squares.push(<LRow key="top" labels={labels}/>);
    for( var i=1; i<=8; i++ ) {
        const l = this.props.app.state.whiteMe ? 9 - i : i;
        const r = i % 2 === 0
          ? <Row label={l} key={i} type={0} />
          : <Row label={l} key={i} type={1} />
        squares.push(r);
    }
    squares.push(<LRow key="bottom" labels={labels}/>);

    return (
        <div className="card board">
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
      <tr key={this.props.key}>
        {this.props.labels.map( l => <LCell text={l} key={l}/>)}
      </tr>
    );
  }
}

class Row extends Component {
  render() {
    let cs = [];
    for( var i=1; i<=8; i++ ) {
      const c = i % 2 === this.props.type
        ? <BCell key={'c' + this.props.label + i} />
        : <WCell key={'c' + this.props.label + i} />
      cs.push(c);
    }

    return (
      <tr key={this.props.key}>
        <LCell text={this.props.label} />
        {cs}
        <LCell text={this.props.label} />
      </tr>
    );
  }
}

class LCell extends Component {
  render() {
    return (
      <td className="cell-label" key={this.props.key}>{this.props.text}</td>
    );
  }
}

class WCell extends Component {
  render() {
    return (
      <td className="cell-white" key={this.props.key}></td>
    );
  }
}

class BCell extends Component {
  render() {
    return (
      <td className="cell-black" key={this.props.key}></td>
    );
  }
}
