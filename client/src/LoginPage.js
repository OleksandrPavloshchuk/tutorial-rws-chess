import React, { Component } from 'react';

import MediatorClient from './mediatorClientService'

// TODO (2019/01/15) how to invoke invalid style of control?

export default class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.mediatorClient = new MediatorClient();

    this.state = {login: "", password: "", errorMessage: null };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

  }

  onChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();
    this.mediatorClient.login(
      this.state.login,
      this.state.password,
      player => {this.props.parent.setPlayer(player);},
      players => {this.props.parent.playersAdd(players);},
      players => {this.props.parent.playersRemove(players);},
      errorMessage => {
        this.setState({errorMessage : errorMessage});
        console.log("LOGIN", errorMessage);
      }
    );
  }

  render() {
    return (
      <div className="container col-md-6">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          </nav>
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
