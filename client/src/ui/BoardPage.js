import React, { Component } from 'react';

import '../assets/css/board.css';

import Board from './Board';
import MoveList from './MoveList';
import Navigation from './Navigation';
import ConversionPanel from './ConversionPanel';
import QuestionModal from './QuestionModal';

export default class BoardPage extends Component {

    constructor(props) {
        super(props);

        this.resign = this.resign.bind(this);
        this.deuce = this.deuce.bind(this);
        this.returnToPlayerList = this.returnToPlayerList.bind(this);
    }

    returnToPlayerList = () => this.props.app.endGame();  
    resign = () => this.props.app.setState({askResign:true, acceptDeuce:false, askDeuce:false, confirmDeuce:false});
    deuce = () => this.props.app.setState({askDeuce:true, acceptDeuce:false, askResign:false, confirmDeuce:false});

    render = () => (
        <div className="container">
            {this.props.app.isConfirm() && <QuestionModal app={this.props.app} />}
            <Navigation>
                {this.props.app.state.message && <Message text={this.props.app.state.message}/>}
                {this.props.app.state.endGame 
                    ? ( <ExitButton onClick={this.returnToPlayerList} /> ) 
                    : ( this.props.app.state.myMove 
                        ? ( <GameActions deuce={this.deuce} resign={this.resign} /> ) 
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
        <AskButton action={props.deuce} text="Deuce" />
        <AskButton action={props.resign} text="Resign" />
    </div>;
}

function AskButton(props) {
	return <button className="btn btn-outline-secondary" onClick={props.action}>{props.text}</button>
}
