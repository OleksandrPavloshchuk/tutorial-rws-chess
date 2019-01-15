import React, { Component } from 'react';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage'
import PlayerListPage from './PlayerListPage'
import MediatorClient from './mediatorClientService'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();
    this.playerListPage = <PlayerListPage parent={this}/>;

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
    this.mediatorClient.logout(this.state.player);
    this.setState({player : null});
  }

  playersAdd(players) {

    console.log("TRACE add players", players);

    if( !this.state.player ) {
      return;
    }
    // TODO
  }

  playersRemove(players) {

    console.log("TRACE remove players", players);

    if( !this.state.player ) {
      return;
    }
    // TODO
  }

  render() {

    return (
      <div className="container">
        {this.state.player && this.playerListPage}
        {!this.state.player && <LoginPage parent={this}/>}
      </div>
    );
  }
}
