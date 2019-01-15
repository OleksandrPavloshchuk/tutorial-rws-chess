import React, { Component } from 'react';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage'
import MediatorClient from './mediatorClientService'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();

    this.state = {
        player: null,
        players: []
    };

    this.setPlayer = this.setPlayer.bind(this);
    this.logout = this.logout.bind(this);
    this.playersAdd = this.playersAdd.bind(this);
    this.playersRemove = this.playersRemove.bind(this);
  }

  setPlayer(player) {
    this.setState({player : player});
    this.mediatorClient.retrieveWaitingPlayers(player)
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
    var p = [];
    this.state.players.forEach(i => p.push(i));
    players.forEach(i => {
      if (!p.includes(i) ) {
        p.push(i);
      }
    });
    this.setState({players:p});
  }

  playersRemove(players) {
    console.log("TRACE remove players", players);

    if( !this.state.player ) {
      return;
    }
    var p = [];
    this.state.players.forEach(i => {
      if (!players.includes(i) ) {
        p.push(i);
      }
    });
    this.setState({players:p});
  }

  render() {
    const items = this.state.players.map( name => <li key={name}>{name}</li>)

    return (
      <div className="container">
        {this.state.player &&
          <div className="container">
            <nav className="navbar navbar-light bg-light navbar-small">
              <span className="navbar-text">{this.state.player}</span>
              <button className="btn btn-outline-secondary" onClick={this.logout}>Logout</button>
            </nav>
            <div className="container">
              <ol>
                {items}
              </ol>
            </div>
          </div>
        }
        {!this.state.player && <LoginPage parent={this}/>}
      </div>
    );
  }
}
