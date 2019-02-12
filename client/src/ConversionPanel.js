import React, { Component } from 'react';

export default class ConversionPanel extends Component {

	constructor(props) {
    	super(props);
    	this.selectPieceType = this.selectPieceType.bind(this);
  	}

  	selectPieceType(type) {
    	this.props.app.setState({ showConversion: false });
    	this.props.app.moveComplete(this.props.app.state.moveFrom,
      		this.props.app.state.moveTo, this.props.app.state.take, type);
  	}

  	render() {
    	const color = this.props.app.state.whiteMe ? "white" : "black";
    	return  <div className="conversion-panel">
      		<div className="btn-group-vertical conversion-panel" role="group">
				<Option color={color} type="queen" select={this.selectPieceType} />
				<Option color={color} type="rook" select={this.selectPieceType} />
				<Option color={color} type="bishop" select={this.selectPieceType} />
				<Option color={color} type="knight" select={this.selectPieceType} />
      		</div>
      	</div>;
  	}
}

function Option(props) {
    const className = "btn btn-light piece " + props.type + "-" + props.color;
	return <button type="button" className={className} onClick={e=>props.select(props.type)}></button>;
}
