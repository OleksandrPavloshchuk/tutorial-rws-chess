import React, { Component } from 'react';

import MediatorClient from './mediatorClientService'

export default class PlayerListPage extends Component {

  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();
  }

  render() {
      return (
        <div className="container">
          <nav className="navbar navbar-light bg-light navbar-small">
            <span className="navbar-text">{this.props.parent.state.player}</span>
            <button className="btn btn-outline-secondary" onClick={this.props.parent.logout}>Logout</button>
          </nav>
          <div className="container">TODO available players list</div>
        </div>
      );
  }
}
