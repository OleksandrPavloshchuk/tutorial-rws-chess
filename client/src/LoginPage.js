import React, { Component } from 'react';

import Logo from './Logo';

export default class LoginPage extends Component {

  constructor(props) {
    super(props);

    this.state = { login: "", password: "", errorMessage: null};

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
  }
  
  onReset = event => { event.preventDefault(); this.setState({ login: "", password: "", errorMessage: undefined }) };    
  onChange = event => this.setState({ [event.target.name] : event.target.value });

  onSubmit = event => {
    event.preventDefault();
    this.props.app.mediatorClient.startSession(
      this.state.login,
      this.state.password,      
      {
        "LOGIN_ERROR":    (msg) => { this.setState({errorMessage:msg.text}); console.log("ERROR", msg.text); },
        "PLAYERS_ADD":    (msg) => this.props.app.playersAdd(msg.players),
        "PLAYERS_REMOVE": (msg) => this.props.app.playersRemove(msg.players),
        "GAME_START":     (msg) => this.props.app.startGame(msg.from, msg.white),
        "MOVE":           (msg) => this.props.app.moveOther(msg.moveFrom, msg.moveTo, msg.piece, msg.text),
        "SURRENDER":      (msg) => this.props.app.win(msg.text),
        "ASK_DEUCE":      ()    => this.props.app.onAskDeuce(),
        "DEUCE":          ()    => this.props.app.deuce(),
        "LOGIN_OK":       ()    => this.props.app.setPlayer(this.state.login)
      }
    );
  };

  render = () => (
      <div className="container col-md-6">
        <nav className="navbar navbar-light bg-light navbar-small"><Logo/></nav>
        {this.state.errorMessage &&
        <div className="alert alert-danger">{this.state.errorMessage}</div>
        }
        <form onSubmit={this.onSubmit} onReset={this.onReset}>
          <div className="form-group">
            <label htmlFor="login">Login:</label>
            <input className={"form-control " + (this.state.login.length>0 ? "is-valid" : "is-invalid")} type="text" required={true}
              name="login" value={this.state.login} onChange={this.onChange} placeholder="Enter login here"/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input className="form-control" type="password"
              name="password" value={this.state.password} onChange={this.onChange} />
          </div>
          <div className="form-group row">
            <div className="col-auto"><input type="submit" className="btn btn-outline-primary col-auto"/></div>
            <input type="reset" className="btn btn-outline-secondary col-auto" />
          </div>
        </form>
      </div>
  );

}
