import React, { Component } from 'react';

import Navigation from './Navigation';

export default class PlayerListPage extends Component {

    componentDidMount() {
        this.props.app.mediatorClient.retrieveWaitingPlayers();
    }

    render() {
        return <div className="container">
            <Navigation>
                <span className="navbar-text">{this.props.app.getState().player}</span>
                <button className="btn btn-outline-secondary" onClick={this.props.app.logout}>Logout</button>
            </Navigation>
            <ul className="list-group">
                {this.props.app.getState().waitingPlayers.map( name => <Player playerName={name} app={this.props.app} key={name} /> )}
            </ul>
        </div>;
    }
}

function Player(props) {
    return <li className="list-group-item list-group-item-action" key={props.playerName}>
        {props.playerName}
        <div className="btn-group float-right" role="group">
            <Button text="Play White" clickHandler={e => props.app.startGameMe(props.playerName, true)} />
            <Button text="Play Black" clickHandler={e => props.app.startGameMe(props.playerName, false)} />
        </div>
    </li>;
}

function Button(props) {
    return <button className="btn btn-outline-success" onClick={props.clickHandler}>{props.text}</button>;
}


