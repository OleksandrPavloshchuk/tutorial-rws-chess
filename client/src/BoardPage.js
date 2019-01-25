import React, { Component } from 'react';

import './assets/css/board.css';

import Board from './Board';
import MoveList from './MoveList';
import Logo from './Logo';
import ConversionPanel from './ConversionPanel';


// TODO (2019/01/17) link Reactstrap here
export default class BoardPage extends Component {
  constructor(props) {
    super(props);

    this.surrender = this.surrender.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
    this.returnToPlayerList = this.returnToPlayerList.bind(this);
  }

  returnToPlayerList() {
    this.props.app.endGame();
  }

  surrender() {
    // TODO 92019/01/17) replace it by React modal
    if (window.confirm("Surrender?")) {
      this.props.app.setState({myMove:false, endGame:true, message:'You lose'});
      this.props.app.mediatorClient.sendGameMessage(
        this.props.app.state.player, this.props.app.state.otherPlayer, "SURRENDER",
        "Your opponent just have surrender. You win.");
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
        <nav className="navbar navbar-light bg-light navbar-small"><Logo/>
          {this.props.app.state.message &&
          <div className="navbar-small float-right">{this.props.app.state.message}</div>
          }
          {(!this.props.app.state.endGame && !this.props.app.state.myMove) &&
          <div className="waiting-opponent navbar-small float-right"></div>
          }
          {(!this.props.app.state.endGame && this.props.app.state.myMove) &&
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-secondary" onClick={this.askDeuce}
            >Deuce</button>
            <button className="btn btn-outline-secondary" onClick={this.surrender}
            >Surrender</button>
          </div>
          }
          {this.props.app.state.endGame &&
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-secondary" onClick={this.returnToPlayerList}
            >Exit</button>
          </div>
          }
        </nav>
        <div className="row">
          <Board app={this.props.app} />
          {this.props.app.state.showConversion &&
            <ConversionPanel app={this.props.app} />
          }
          <MoveList app={this.props.app} />
        </div>
      </div>
    );
  }
}
