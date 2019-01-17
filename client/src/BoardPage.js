import React, { Component } from 'react';

// TODO (2019/01/17) link Reactstrap here
export default class BoardPage extends Component {
  constructor(props) {
    super(props);

    this.askSurrender = this.askSurrender.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
  }

  askSurrender() {
    // TODO 92019/01/17) replace it by React modal
    this.setState({myMove:false});
    if (window.confirm("Ask surrender?")) {
      this.props.parent.mediatorClient.sendGameMessage(
        this.props.parent.state.player, this.props.parent.state.otherPlayer, "ASK_SURRENDER");
    }
  }

  askDeuce() {
    // TODO 92019/01/17) replace it by React modal
    this.setState({myMove:false});
    if (window.confirm("Ask deuce?")) {
      this.props.parent.mediatorClient.sendGameMessage(
        this.props.parent.state.player, this.props.parent.state.otherPlayer, "ASK_DEUCE");
    }
  }

  render() {

    return (
      <div className="container">
        <nav className="navbar navbar-light bg-light navbar-small">
          <span className="navbar-brand">Tutorial RWS Chess</span>
          <div className="btn-group float-right" role="group">
            <button className="btn btn-outline-warning" disabled={!this.props.parent.state.myMove}
              onClick={this.askDeuce}
            >Deuce</button>
            <button className="btn btn-outline-danger" disabled={!this.props.parent.state.myMove}
              onClick={this.askSurrender}
            >Surrender</button>
          </div>
        </nav>
        {this.props.parent.state.whiteMe &&
          <div className="container">
          <div className="alert alert-warning">BLACK: {this.props.parent.state.otherPlayer}</div>
          <div className="alert alert-success">WHITE: {this.props.parent.state.player}</div>
          </div>
        }
        {!this.props.parent.state.whiteMe &&
          <div className="container">
          <div className="alert alert-success">WHITE: {this.props.parent.state.otherPlayer}</div>
          <div className="alert alert-warning">BLACK: {this.props.parent.state.player}</div>
          </div>
        }
        TODO: draw board here

      </div>
    );
  }
}
