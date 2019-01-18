import React, { Component } from 'react';

import './assets/css/board.css';

export default class Board extends Component {

  render() {

    function renderWhiteHeader(key) {
      return <tr key={key}>
              <td className="square-label"></td>
              <td className="square-label">a</td>
              <td className="square-label">b</td>
              <td className="square-label">c</td>
              <td className="square-label">d</td>
              <td className="square-label">e</td>
              <td className="square-label">f</td>
              <td className="square-label">g</td>
              <td className="square-label">h</td>
              <td className="square-label"></td>
             </tr>;
    }

    function renderBlackHeader(key) {
      return <tr key={key}>
              <td className="square-label"></td>
              <td className="square-label">h</td>
              <td className="square-label">g</td>
              <td className="square-label">f</td>
              <td className="square-label">e</td>
              <td className="square-label">d</td>
              <td className="square-label">c</td>
              <td className="square-label">b</td>
              <td className="square-label">a</td>
              <td className="square-label"></td>
             </tr>;
    }

    function renderRowBlackFirst(i) {
      return <tr key={'row' + i}>
              <td className="square-label">{i}</td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="square-label">{i}</td>
             </tr>;
    }

    function renderRowWhiteFirst(i) {
      return <tr key={'row' + i}>
              <td className="square-label">{i}</td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="white-square"></td>
              <td className="black-square"></td>
              <td className="square-label">{i}</td>
             </tr>;
    }


    let squares = [];
    if( this.props.app.state.whiteMe ) {
      squares.push( renderWhiteHeader("htop") );
      squares.push( renderRowBlackFirst(8) );
      squares.push( renderRowWhiteFirst(7) );
      squares.push( renderRowBlackFirst(6) );
      squares.push( renderRowWhiteFirst(5) );
      squares.push( renderRowBlackFirst(4) );
      squares.push( renderRowWhiteFirst(3) );
      squares.push( renderRowBlackFirst(2) );
      squares.push( renderRowWhiteFirst(1) );
      squares.push( renderWhiteHeader("hbottom") );
    } else {
      squares.push( renderBlackHeader("htop") );
      squares.push( renderRowBlackFirst(1) );
      squares.push( renderRowWhiteFirst(2) );
      squares.push( renderRowBlackFirst(3) );
      squares.push( renderRowWhiteFirst(4) );
      squares.push( renderRowBlackFirst(5) );
      squares.push( renderRowWhiteFirst(6) );
      squares.push( renderRowBlackFirst(7) );
      squares.push( renderRowWhiteFirst(8) );
      squares.push( renderBlackHeader("hbottom") );
    }

    return (
        <div className="card board">
          <div className="card-body">
            {this.props.app.state.whiteMe &&
            <table><tbody>
            <tr><td colSpan="10"><h5 className="card-title text-center">{this.props.app.state.otherPlayer}</h5></td></tr>
            {squares}
            <tr><td colSpan="10"><h5 className="card-title text-center">{this.props.app.state.player}</h5></td></tr>
            </tbody></table>
            }
            {!this.props.app.state.whiteMe &&
            <table><tbody>
            <tr><td colSpan="10"><h5 className="card-title text-center">{this.props.app.state.otherPlayer}</h5></td></tr>
            {squares}
            <tr><td colSpan="10"><h5 className="card-title text-center">{this.props.app.state.player}</h5></td></tr>
            </tbody></table>
            }
          </div>
        </div>
    );
  }
}
