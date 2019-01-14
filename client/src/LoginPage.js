import React, { Component } from 'react';

import './assets/css/LoginPage.css';

class LoginPage extends Component {

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

    fetch("http://localhost:3016/login", {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      body: JSON.stringify({
        name: this.state.login,
        password: this.state.password
      })
    }).then((result) => {
        if( !result || result.length>0 ) {
          this.setState({errorMessage : result});
        } else {
          this.props.parent.setPlayer(this.state.login);
        }
      }, (error) => {
        this.setState({errorMessage : error});
      });
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
