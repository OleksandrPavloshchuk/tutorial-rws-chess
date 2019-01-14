import React, { Component } from 'react';

import './assets/css/PlayerListPage.css';

import MediatorClient from './mediatorClientService'

class PlayerListPage extends Component {

  render() {
      return (
        <div className="PlayerListPage">
          <header>
            <span className="activePlayer">{this.props.parent.state.player}</span>
            <button className="logout" onClick={this.props.parent.logout}>Logout</button>
          </header>
          <div>TODO available players list</div>
        </div>
      );
  }
};

export default PlayerListPage;
