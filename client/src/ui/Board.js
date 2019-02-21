import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-drag-and-drop';
import { Motion, spring } from 'react-motion';
import getPieceStyle from './pieceStyleSupplier';

import '../assets/css/board.css';

export default function Board(props) {
    let squares = [];

    let labels = ['a','b','c','d','e','f','g','h'];
    if( !props.app.state.whiteMe ) { labels = labels.reverse(); }

    squares.push(<LRow aKey="top" key="top" labels={labels}/>);
    for( var i=1; i<=8; i++ ) {
        const l = props.app.state.whiteMe ? 9 - i : i;
        const key = "r" + i;
        squares.push(<Row label={l} key={key} aKey={key} type={i % 2} app={props.app} />);
    }
    squares.push(<LRow aKey="bottom" key="bottom" labels={labels}/>);

    return <div className="card board "><div className="card-body board-wrapper"><table><tbody>
        <Player name={props.app.state.otherPlayer} />
        {squares}
        <Player name={props.app.state.player} />
    </tbody></table></div></div>;
}

var Player = props => <tr><td colSpan="10">
    <h5 className="card-title text-center">{props.name}</h5></td></tr>;
    
var LRow = props => <tr key={props.aKey}><td></td>
    {props.labels.map( l => <LCell text={l} key={l} aKey={l}/>)}<td></td></tr>;
    
var LCell = props => <td className="cell-label" key={props.aKey}>{props.text}</td>;    

function Row(props) {
    let cells = [];

    for(var i=1; i<=8; i++ ) {
        const lc = props.app.state.whiteMe ? i  : 9 - i;
        const key = 'c' + props.label + lc;
        cells.push(<Cell key={key} aKey={key} white={(i % 2) !== props.type} app={props.app} />);
    }
    
    const rowNum = <td className="cell-label">{props.label}</td>;
    return <tr key={props.aKey}>{rowNum}{cells}{rowNum}</tr>;
}


class Cell extends Component {

    constructor(props) {
        super(props);
        this.getStyle = this.getStyle.bind(this);
    }

    getStyle = () => {
       const s =  this.props.app.state.cellSize + 'px';
       return { width: s, height: s };
    };

    render() {
    	const piece = this.props.app.state.board.get(this.props.aKey);
    	const draggable = piece 
        && this.props.app.state.myMove 
        && !this.props.app.state.showConversion 
        && !this.props.app.state.endGame
        && ((this.props.app.state.whiteMe && piece.white)
        || (!this.props.app.state.whiteMe && !piece.white));

        const cellIsAvailable = this.props.app.state.board.isAvailable(this.props.aKey);        
        const className = 'board-cell cell-' + (this.props.white ? 'white' : 'black') + (cellIsAvailable ? ' cell-available' : '');

        var renderDroppable = () => <Droppable types={['piece']} onDrop={key => this.props.app.dropPiece(key, this.props.aKey)} style={this.getStyle()}>
                {piece 
                    ? <Piece white={piece.white} type={piece.type} position={this.props.aKey} draggable={draggable} app={this.props.app} />
                    : <div className="cell-empty">&nbsp;</div>}
            </Droppable>;

        var renderClickable = () => <div onClick={event => 
                this.props.app.dropPiece({piece:this.props.app.state.moveFrom}, this.props.aKey)} style={this.getStyle()}>
                {piece 
                    ? <Piece white={piece.white} type={piece.type} position={this.props.aKey} draggable={draggable} app={this.props.app} />
                    : <div className="cell-empty">&nbsp;</div>}
            </div>;

        return <td className={className} key={this.props.aKey}>
            {this.props.app.state.useDragAndDrop ? renderDroppable() : renderClickable()}
        </td>;
    }
}

class Piece extends Component {

    constructor(props) {
        super(props);
        this.isCurrent = this.isCurrent.bind(this);
        this.renderDraggable = this.renderDraggable.bind(this);
        this.renderClickable = this.renderClickable.bind(this);
        this.renderCommon = this.renderCommon.bind(this);
        this.getStyle = this.getStyle.bind(this);
    }

    isCurrent = () => this.props.app.state.moveOtherTo 
        ? (this.props.position===this.props.app.state.moveOtherTo)
        : false;
        
    renderClickable = () => <div className="piece" style={this.getStyle()}
		onClick={event => this.props.app.moveStart(this.props.position)}></div>;

	renderDraggable = () => <Draggable type="piece" data={this.props.position} 
	    className="piece" style={this.getStyle()}
    	onDragStart={val => this.props.app.moveStart(this.props.position)}></Draggable>;

	renderCommon = () => <div className="piece" style={this.getStyle()} >
    		<Motion defaultStyle={{opacity:1}} style={{opacity: spring(this.isCurrent() ? 1 : 0)}}>
        		{style => <div style={{opacity: !this.props.app.state.myMove ? 0 : style.opacity}} className="haze"></div>}
        	</Motion>
    	</div>;
    
    getStyle = () => getPieceStyle(this.props.app.state.cellSize, this.props.type, this.props.white);            

    render = () => this.props.draggable
            ? (this.props.app.state.useDragAndDrop ? this.renderDraggable() : this.renderClickable())
            : this.renderCommon();

}
