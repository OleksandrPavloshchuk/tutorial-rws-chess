import React, { Component } from 'react';

export default class ConversionPanel extends Component {

	constructor(props) {
    	super(props);
    	this.selectPieceType = this.selectPieceType.bind(this);
    	this.getStyle = this.getStyle.bind(this);
  	}

  	selectPieceType(type) {
    	this.props.app.setState({ showConversion: false });
    	this.props.app.moveComplete(this.props.app.state.moveFrom,
      		this.props.app.state.moveTo, this.props.app.state.take, type);
  	}
  	
    getStyle = type => {
       const cs = this.props.app.state.cellSize; 
       const s =  cs + 'px';
       const bs = (cs * 6) + 'px ' + (cs * 2) + 'px ';
       const offsetX = backgroundOffsets[type] * cs;
       const offsetY = this.props.app.state.whiteMe ? 0 : cs;
       return {
			backgroundSize: bs, 
            backgroundPosition: offsetX + 'px ' + offsetY + 'px',
            width: s, height: s            
       };
    };  	

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

const backgroundOffsets = {
	king: 0.0, queen: 5.0, bishop: 4.0, knight: 3.0, rook: 2.0, pawn: 1.0
}
