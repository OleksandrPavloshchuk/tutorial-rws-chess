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
    this.props.app.setState({message:undefined});
  }

  askSurrender() {
    // TODO 92019/01/17) replace it by React modal
    if (window.confirm("Ask surrender?")) {
      this.props.app.setState({myMove:false});
      this.props.app.mediatorClient.sendGameMessage(
        this.props.app.state.player, this.props.app.state.otherPlayer, "ASK_SURRENDER");
    }
  }

  askDeuce() {
    // TODO 92019/01/17) replace it by React modal
    if (window.confirm("Ask deuce?")) {
      this.props.app.setState({myMove:false});
      this.props.app.mediatorClient.sendGameMessage(
        this.props.app.state.player, this.props.app.state.otherPlayer, "ASK_DEUCE");
    }
  }

  render() {

    return (
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          {!this.props.app.state.myMove &&
          <div className="waiting-opponent navbar-small float-right"></div>
          }
          {this.props.app.state.myMove &&
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-secondary" onClick={this.askDeuce}
            >Deuce</button>
            <button className="btn btn-outline-secondary" onClick={this.askSurrender}
            >Surrender</button>
          </div>
          }
        </nav>
        <div className="row">
          <Board app={this.props.app} />
          <MoveList app={this.props.app} />
        </div>
        {this.props.app.state.message &&
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {this.props.app.state.message}
            <button type="button" className="close" onClick={this.hideMessage}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        }
      </div>
    );
  }
}
