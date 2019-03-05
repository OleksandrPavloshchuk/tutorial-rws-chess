import React, { Component } from 'react';

import Navigation from './Navigation';

export default class PlayerListPage extends Component {

    componentDidMount = () => {
        this.props.app.dispatch({type:"UI_RETRIEVE_PLAYERS"});
    }

    render = () => <div className="container">
            <Navigation>
                <span className="navbar-text">{this.props.app.getState().player}</span>
                <button className="btn btn-outline-secondary" onClick={e => this.props.app.dispatch({type:"UI_LOGOUT"})}>Logout</button>
            </Navigation>
            <ul className="list-group">
                {this.props.app.getState().waitingPlayers.map( name => <Player playerName={name} app={this.props.app} key={name} /> )}
            </ul>
        </div>;
}

function Player(props) {
    return <li className="list-group-item list-group-item-action" key={props.playerName}>
        {props.playerName}
        <div className="btn-group float-right" role="group">
            <Button text="Play White" white={true} app={props.app} otherPlayer={props.playerName} />
            <Button text="Play Black" white={false} app={props.app} otherPlayer={props.playerName} />
        </div>
    </li>;
}

function Button(props) {
    return <button className="btn btn-outline-success"
        onClick={e => props.app.dispatch({type:"UI_START_GAME", payload: {from:props.otherPlayer, white:props.white}})}>
        {props.text}</button>;
}
