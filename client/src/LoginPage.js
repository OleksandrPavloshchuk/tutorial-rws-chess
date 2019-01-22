import React, { Component } from 'react';

import Logo from './Logo';

// TODO (2019/01/15) how to invoke invalid style of control?

export default class LoginPage extends Component {

  constructor(props) {
    super(props);

    this.state = {login: "", password: "", errorMessage: null };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.app.mediatorClient.startSession(
      this.state.login,
      this.state.password,
      // - login is accepted by server
      player => {this.props.app.setPlayer(player);},
      // - retrieve other players list
      players => {this.props.app.playersAdd(players);},
      // - remove players from list
      players => {this.props.app.playersRemove(players);},
      // - start game
      (other, white) => {this.props.app.startGame(other, white);},
      // - accept move by othe player
      (moveFrom, moveTo, message) => {this.props.app.moveOther(moveFrom, moveTo, message);},
      // - accept surrender by other player
      (message) => {this.props.app.win(message)},
      // - accept query for deuce by other player
      () => {this.props.app.onAskDeuce();},
      // - deuce is accepted by other player
      () => {this.props.app.deuce();},
      // - handle error
      errorMessage => {
        this.setState({errorMessage : errorMessage});
        console.log("LOGIN ERROR", errorMessage);
      }
    );
  }

  render() {
    return (
      <div className="container col-md-6">
        <nav className="navbar navbar-light bg-light navbar-small"><Logo/></nav>
          <form onSubmit={this.onSubmit}>
          {this.state.errorMessage &&
            <div className="alert alert-danger">{this.state.errorMessage}</div>
          }
          <div className="form-group">
            <label htmlFor="login">Login:</label>
            <input className="form-control" type="text" required={true}
              name="login" value={this.state.login} onChange={this.onChange} />
            </div>
            <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input className="form-control" type="password"
              name="password" value={this.state.password} onChange={this.onChange} />
          </div>
          <div className="form-group">
            <input type="submit" className="btn btn-primary"/>
          </div>
        </form>
      </div>
    );
  }

}
