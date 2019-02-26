import React, { Component } from 'react';
import getPieceStyle from './pieceStyleSupplier';

export default class ConversionPanel extends Component {

	constructor(props) {
    	super(props);
    	this.selectPieceType = this.selectPieceType.bind(this);
    	this.getStyle = this.getStyle.bind(this);
  	}

  	selectPieceType(type) {
    	this.props.app.setState({ showConversion: false });
    	this.props.app.moveComplete(this.props.app.getState().moveFrom,
      		this.props.app.getState().moveTo, this.props.app.getState().take, type);
  	}
  	
  	
  	getStyle = type => getPieceStyle(this.props.app.getState().cellSize, type, this.props.app.getState().whiteMe); 	

  	render() {
    	return  <div className="conversion-panel">
      		<div className="btn-group-vertical conversion-panel" role="group">
				<Option style={this.getStyle("queen")} select={this.selectPieceType} type="queen" />
				<Option style={this.getStyle("rook")} select={this.selectPieceType} type="rook" />
				<Option style={this.getStyle("bishop")} select={this.selectPieceType} type="bishop" />
				<Option style={this.getStyle("knight")} select={this.selectPieceType} type="knight" />
      		</div>
      	</div>;
  	}
}

function Option(props) {
	return <button type="button" style={props.style} className="btn btn-light piece" onClick={e=>props.select(props.type)}></button>;
}
