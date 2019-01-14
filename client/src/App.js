import React, { Component } from 'react';

import './assets/css/App.css';

import LoginPage from './LoginPage'
import PlayerListPage from './PlayerListPage'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        player: null
    };

    this.setPlayer = this.setPlayer.bind(this);
    this.logout = this.logout.bind(this);
  }

  setPlayer(player) {
    this.setState({player : player});
  }

  logout() {
    // TODO call mediator
    this.setState({player : null});
  }

  render() {
    return (
      <div className="App">
        {this.state.player && <PlayerListPage parent={this}/>}
        {!this.state.player && <LoginPage parent={this}/>}
      </div>
    );
  }
}

export default App;
