import React from 'react';

import '../assets/css/board.css';

import Board from './Board';
import MoveList from './MoveList';
import Navigation from './Navigation';
import ConversionPanel from './ConversionPanel';
import QuestionModal from './QuestionModal';

export default props => {
	const dispatch = type => props.app.dispatch({type}); 

	return <div className="container">
            {props.app.isConfirm() && <QuestionModal app={props.app} />}
            <Navigation>
                {props.app.getState().message && <Message text={props.app.getState().message}/>}
                {props.app.getState().endGame 
                    ? ( <ExitButton onClick={e => dispatch("UI_END_GAME")} /> ) 
                    : ( props.app.getState().myMove 
                        ? ( <GameActions deuce={e => dispatch("UI_ASK_DEUCE")} resign={e => dispatch("UI_ASK_RESIGN")} /> ) 
                        : ( <Waiting/> )
                )}
            </Navigation>
            <div className="row">
                <Board app={props.app} />
                {props.app.getState().showConversion && <ConversionPanel app={props.app} />}
                <MoveList app={props.app} />
            </div>
        </div>;
}

const Waiting = props => <div className="waiting-opponent navbar-small float-right"></div>;
const Message = props => <div className="navbar-small float-right">{props.text}</div>;
const ExitButton = props => <div className="btn-group float-right" role="group">
	<button className="btn btn-outline-secondary" onClick={props.onClick}>Exit</button>
</div>;

const GameActions = props => <div className="btn-group float-right" role="group">
	<AskButton action={props.deuce} text="Deuce" />
    <AskButton action={props.resign} text="Resign" />
</div>;

const AskButton = props => <button className="btn btn-outline-secondary" onClick={props.action}>{props.text}</button>;
