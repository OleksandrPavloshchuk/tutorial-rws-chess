import React, { Component } from 'react';

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
    this.props.parent.mediatorClient.startSession(
      this.state.login,
      this.state.password,
      player => {this.props.parent.setPlayer(player);},
      players => {this.props.parent.playersAdd(players);},
      players => {this.props.parent.playersRemove(players);},
      (other, white) => {this.props.parent.startGame(other, white);},
      (move) => {this.props.parent.move(move);},
      (what,ask,message) => {this.props.parent.askGameEnd(what,ask,message);},
      message => {this.props.parent.gameEnd(message);},
      errorMessage => {
        this.setState({errorMessage : errorMessage});
        console.log("LOGIN ERROR", errorMessage);
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
