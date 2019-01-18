import React, { Component } from 'react';

import './assets/css/board.css';

// TODO (2019/01/17) link Reactstrap here
export default class BoardPage extends Component {
  constructor(props) {
    super(props);

    this.askSurrender = this.askSurrender.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
  }

  hideMessage() {
    this.props.parent.setState({message:undefined});
  }

  askSurrender() {
    // TODO 92019/01/17) replace it by React modal
    if (window.confirm("Ask surrender?")) {
      this.props.parent.setState({myMove:false});
      this.props.parent.mediatorClient.sendGameMessage(
        this.props.parent.state.player, this.props.parent.state.otherPlayer, "ASK_SURRENDER");
    }
  }

  askDeuce() {
    // TODO 92019/01/17) replace it by React modal
    if (window.confirm("Ask deuce?")) {
      this.props.parent.setState({myMove:false});
      this.props.parent.mediatorClient.sendGameMessage(
        this.props.parent.state.player, this.props.parent.state.otherPlayer, "ASK_DEUCE");
    }
  }

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
    if( this.props.parent.state.whiteMe ) {
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
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-warning" disabled={!this.props.parent.state.myMove}
              onClick={this.askDeuce}
            >Deuce</button>
            <button className="btn btn-outline-danger" disabled={!this.props.parent.state.myMove}
              onClick={this.askSurrender}
            >Surrender</button>
          </div>
        </nav>
        <div className="card board">
          <div className="card-body">
        {this.props.parent.state.whiteMe &&
          <table><tbody>
          <tr>
          <td colSpan="10"><h5 className="card-title text-center">{this.props.parent.state.otherPlayer}</h5></td>
          </tr>
          {squares}
          <tr>
          <td colSpan="10"><h5 className="card-title text-center">{this.props.parent.state.player}</h5></td>
          </tr>
          </tbody></table>
        }
        {!this.props.parent.state.whiteMe &&
          <table><tbody>
          <tr>
          <td colSpan="10"><h5 className="card-title text-center">{this.props.parent.state.otherPlayer}</h5></td>
          </tr>
          {squares}
          <tr>
          <td colSpan="10"><h5 className="card-title text-center">{this.props.parent.state.player}</h5></td>
          </tr>
          </tbody></table>
        }
          </div>
        </div>
        {this.props.parent.state.message &&
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {this.props.parent.state.message}
            <button type="button" className="close" onClick={this.hideMessage}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        }
      </div>
    );
  }
}
