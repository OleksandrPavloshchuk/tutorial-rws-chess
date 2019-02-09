import React, { Component } from 'react';

import Navigation from './Navigation';

export default class PlayerListPage extends Component {

  componentDidMount() {
    this.props.app.mediatorClient.retrieveWaitingPlayers();
  }

  render() {
    const items = this.props.app.state.waitingPlayers.map( name =>
      <li
        className="list-group-item list-group-item-action" key={name}>
        {name}
        <div className="btn-group float-right" role="group">
          <button className="btn btn-outline-success"
            onClick={ e => this.props.app.startGameMe(name, true) }
          >Play White</button>
          <button className="btn btn-outline-success"
            onClick={ e => this.props.app.startGameMe(name, false) }
          >Play Black</button>
        </div>
      </li>
    )

    return (
      <div className="container">
        <Navigation>
          <span className="navbar-text">{this.props.app.state.player}</span>
          <button className="btn btn-outline-secondary" onClick={this.props.app.logout}>Logout</button>
        </Navigation>
        <ul className="list-group">{items}</ul>
      </div>
    );
  }
}
