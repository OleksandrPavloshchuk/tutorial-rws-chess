import React, { Component } from 'react';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage'
import PlayerListPage from './PlayerListPage'
import BoardPage from './BoardPage'
import MediatorClient from './mediatorClientService'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();

    this.state = {
        player: null,
        white: null,
        black: null
    };

    this.setPlayer = this.setPlayer.bind(this);
    this.logout = this.logout.bind(this);
    this.playersAdd = this.playersAdd.bind(this);
    this.playersRemove = this.playersRemove.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  setPlayer(player) {
    this.setState({player : player});
  }

  startGameMe(other, white) {
    this.mediatorClient.startGame(this.state.player, other, !white);
    this.startGame(other, white);
  }

  startGame(other, white) {
    this.setState({
        white: white ? this.state.player : other,
        black: white ? other : this.state.player
    });
  }

  logout() {
    this.mediatorClient.logout(this.state.player);
    this.setState({player : null});
  }

  playersAdd(players) {
    if( this.state.player && this.playerListPage && this.playerListPage.playersAdd ) {
      this.playerListPage.playersAdd(players);
    }
  }

  playersRemove(players) {
    if( this.state.player && this.playerListPage && this.playerListPage.playersRemove) {
      this.playerListPage.playersRemove(players);
    }
  }

  render() {

    return (
      <div className="container">
        {!this.state.player &&
          <LoginPage parent={this}/>
        }
        {(this.state.player && (!this.state.white || !this.state.black)) &&
          <PlayerListPage parent={this} onRef={ref => (this.playerListPage = ref)} />
        }
        {(this.state.white && this.state.black) &&
          <BoardPage parent={this} onRef={ref => (this.playerListPage = ref)} />
        }
      </div>
    );
  }
}
