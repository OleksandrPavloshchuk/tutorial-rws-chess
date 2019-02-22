import React, { Component } from 'react';
import Navigation from './Navigation';

export default class LoginPage extends Component {

    render = () =>
        <div className="container col-md-6">
            <Navigation/>
            <button onClick={e => this.props.app.startSession()} className="btn btn-outline-primary col-auto">Enter</button>
        </div>;
}
