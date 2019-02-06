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

    render = () => (
        <div className="container">
            {this.props.app.isConfirm() && <QuestionModal app={this.props.app} />}
            <Navigation>
                {this.props.app.state.message && <Message text={this.props.app.state.message}/>}
                {this.props.app.state.endGame 
                    ? ( <ExitButton onClick={this.returnToPlayerList} /> ) 
                    : ( this.props.app.state.myMove 
                        ? ( <GameActions deuce={this.deuce} surrender={this.surrender} /> ) 
                        : ( <Waiting/> )
                )}
            </Navigation>
            <div className="row">
                <Board app={this.props.app} />
                {this.props.app.state.showConversion && <ConversionPanel app={this.props.app} />}
                <MoveList app={this.props.app} />
            </div>
        </div>);
}

function Waiting(props) { return <div className="waiting-opponent navbar-small float-right"></div>; }
function Message(props) { return <div className="navbar-small float-right">{props.text}</div>; }
function ExitButton(props) {
    return <div className="btn-group float-right" role="group">
        <button className="btn btn-outline-secondary" onClick={props.onClick}>Exit</button>
    </div>;
}

function GameActions(props) {
    return <div className="btn-group float-right" role="group">
        <button className="btn btn-outline-secondary" onClick={props.deuce}>Deuce</button>
        <button className="btn btn-outline-secondary" onClick={props.surrender}>Surrender</button>
    </div>;
}
