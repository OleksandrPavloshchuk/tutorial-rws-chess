import React, { Component } from 'react';

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
            onClick={ e =>
              this.props.app.startGameMe(name, true) }
          >Play White</button>
          <button className="btn btn-outline-success"
            onClick={ e =>
              this.props.app.startGameMe(name, false) }
          >Play Black</button>
        </div>
      </li>
    )

    return (
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          <span className="navbar-text">{this.props.app.state.player}</span>
          <button className="btn btn-outline-secondary" onClick={this.props.app.logout}>Logout</button>
        </nav>
        <ul className="list-group">
          {items}
        </ul>
      </div>
    );
  }
}
