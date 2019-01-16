import React, { Component } from 'react';

import MediatorClient from './mediatorClientService'

export default class BoardPage extends Component {
  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();
  }

  componentDidMount() {
    this.props.onRef(this);
    // TODO send GAME_START message to server
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  render() {

    return (
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-warning">Deuce</button>
            <button className="btn btn-outline-danger">Surrender</button>
          </div>
        </nav>
        <div className="alert alert-success">WHITE: {this.props.parent.state.white}</div>
        <div className="alert alert-warning">BLACK: {this.props.parent.state.black}</div>
        TODO: draw board here
      </div>
    );
  }
}
