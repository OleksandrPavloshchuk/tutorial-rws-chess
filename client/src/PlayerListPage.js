import React, { Component } from 'react';

import MediatorClient from './mediatorClientService'

export default class PlayerListPage extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();

    this.state = {
        players: []
    };

    this.playersAdd = this.playersAdd.bind(this);
    this.playersRemove = this.playersRemove.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  playersAdd(players) {
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
    var p = [];
    this.state.players.forEach(i => {
      if (!players.includes(i) ) {
        p.push(i);
      }
    });
    this.setState({players:p});
  }

  render() {
    const items = this.state.players.map( name =>
      <a href="#"
        className="list-group-item list-group-item-action" key={name}>{name}</a>
    )

    return (
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          <span className="navbar-text">{this.props.parent.state.player}</span>
          <button className="btn btn-outline-secondary" onClick={this.props.parent.logout}>Logout</button>
        </nav>
        <div className="list-group">
          {items}
        </div>
      </div>
    );
  }
}
