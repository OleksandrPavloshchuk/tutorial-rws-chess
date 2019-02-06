import React, { Component } from 'react';

import './assets/css/board.css';

import Board from './Board';
import MoveList from './MoveList';
import Navigation from './Navigation';
import ConversionPanel from './ConversionPanel';
import QuestionModal from './QuestionModal';

export default class BoardPage extends Component {
  constructor(props) {
    super(props);

    this.surrender = this.surrender.bind(this);
    this.deuce = this.deuce.bind(this);
    this.returnToPlayerList = this.returnToPlayerList.bind(this);
  }

  returnToPlayerList = () => this.props.app.endGame();  
  surrender = () => this.props.app.setState({askSurrender:true, acceptDeuce:false, askDeuce:false, confirmDeuce:false});
  deuce = () => this.props.app.setState({askDeuce:true, acceptDeuce:false, askSurrender:false, confirmDeuce:false});

    render() {

    return (
        <div className="container">
            {this.props.app.isConfirm() &&
                <QuestionModal app={this.props.app} />
            }
            <Navigation>
              {this.props.app.state.message && <div className="navbar-small float-right">{this.props.app.state.message}</div>}
            {this.props.app.state.endGame ? (
                <div className="btn-group float-right" role="group">
                    <button className="btn btn-outline-secondary" onClick={this.returnToPlayerList}>Exit</button>
                </div>           
            ) : (
                this.props.app.state.myMove ? (
                    <div className="btn-group float-right" role="group">
                        <button className="btn btn-outline-secondary" onClick={this.deuce}>Deuce</button>
                        <button className="btn btn-outline-secondary" onClick={this.surrender}>Surrender</button>
                    </div>
                ) : (
                    <div className="waiting-opponent navbar-small float-right"></div>
                )    
            )}
        </Navigation>
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
