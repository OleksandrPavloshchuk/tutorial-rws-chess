import React, { Component } from 'react';

import './assets/css/LoginPage.css';

class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {login: null, password: null, errorMessage: null };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.allowedCreds = {
      "user-1": "123456",
      "user-2": "654321"
    };    
  }

  onChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();

    // TODO (2019/01/14) check credentials using mediator
    const errorMessage = this.allowedCreds[this.state.login]===this.state.password
      ? null
      : "Login failed";
    if( errorMessage ) {
      this.setState({errorMessage : errorMessage});
    } else {
      this.props.parent.setPlayer(this.state.login);
    }
  }

  render() {
    return (
      <form className="Login" method="POST" action="#" onSubmit={this.onSubmit}>
        {this.state.errorMessage &&
        <div className="error">{this.state.errorMessage}</div>
        }
        <label htmlFor="login">Login:</label>
        <input type="text" name="login" value={this.state.login} onChange={this.onChange} />
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" value={this.state.password} onChange={this.onChange} />
        <input type="submit"/>
        <input type="reset"/>
      </form>
    );
  }

};

export default LoginPage;
