import React, { Component } from 'react';

export default class ConversionPanel extends Component {
  constructor(props) {
    super(props);

    this.selectPieceType = this.selectPieceType.bind(this);
  }

  selectPieceType(type) {
    this.props.app.setState({
      newPieceType: type, showConversion: false
    });
    this.props.app.moveComplete(type);
  }

  render() {
    const color = this.props.app.state.whiteMe ? "white" : "black";
    return (
      <div className="conversion-panel">
      <div className="btn-group-vertical conversion-panel" role="group">
        <button type="button" className={"btn btn-link piece queen-" + color}
          onClick={i=>this.selectPieceType("queen")}></button>
        <button type="button" className={"btn btn-link piece rook-" + color}
          onClick={i=>this.selectPieceType("rook")}></button>
        <button type="button" className={"btn btn-link piece bishop-" + color}
          onClick={i=>this.selectPieceType("bishop")}></button>
          <button type="button" className={"btn btn-link piece knight-" + color}
            onClick={i=>this.selectPieceType("knight")}></button>
      </div>
      </div>
    );
  }
}
