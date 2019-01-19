import React, { Component } from 'react';

import './assets/css/board.css';

import Board from './Board';
import MoveList from './MoveList';


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
        <div className="row">
          <Board app={this.props.parent} />
          <MoveList app={this.props.parent} />
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
