import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-drag-and-drop';
import {Motion, spring} from 'react-motion';

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

    return <div className="card board "><div className="card-body"><table><tbody>
        <Player name={props.app.state.otherPlayer} />
        {squares}
        <Player name={props.app.state.player} />
    </tbody></table></div></div>;
}

function Player(props) {
    return <tr><td colSpan="10"><h5 className="card-title text-center">{props.name}</h5></td></tr>;
}

function LRow(props) {
    return <tr key={props.aKey}><td></td>
        {props.labels.map( l => <LCell text={l} key={l} aKey={l}/>)}
    <td></td></tr>;
}

function Row(props) {
    let cs = [];

    for(var i=1; i<=8; i++ ) {
        const lc = props.app.state.whiteMe ? i  : 9 - i;
        const key = 'c' + props.label + lc;
        cs.push(<Cell key={key} aKey={key} white={(i % 2) !== props.type} app={props.app} />);
    }

    return <tr key={props.aKey} >
        <td className="cell-label">{props.label}</td>
        {cs}
        <td className="cell-label">{props.label}</td>
    </tr>
}

function LCell(props) {
    return <td className="cell-label" key={props.aKey}>{props.text}</td>;
}

function Cell(props) {

    const piece = props.app.state.board.get(props.aKey);
    const draggable = piece 
        && props.app.state.myMove 
        && !props.app.state.showConversion 
        && !props.app.state.endGame
        && ((props.app.state.whiteMe && piece.white)
        || (!props.app.state.whiteMe && !piece.white));

        const cellIsAvailable = props.app.state.board.isAvailable(props.aKey);        
        const className = 'cell-' + (props.white ? 'white' : 'black') + (cellIsAvailable ? ' cell-available' : '');

    var renderDroppable = () => <Droppable types={['piece']} onDrop={key => props.app.dropPiece(key, props.aKey)}>
                {piece 
                    ? <Piece white={piece.white} type={piece.type} position={props.aKey} draggable={draggable} app={props.app} />
                    : <div className="cell-empty">&nbsp;</div>}
            </Droppable>;

      var renderClickable = () => <div onClick={event => props.app.dropPiece({piece:props.app.state.moveFrom}, props.aKey)}>
                {piece 
                    ? <Piece white={piece.white} type={piece.type} position={props.aKey} draggable={draggable} app={props.app} />
                    : <div className="cell-empty">&nbsp;</div>}
            </div>;

        return <td className={className} key={props.aKey}>
            {props.app.state.useDragAndDrop  
			? renderDroppable()
            : renderClickable()}
        </td>;
}

class Piece extends Component {

    constructor(props) {
        super(props);

        const screenWidth = this.props.app.elem.clientWidth;
        var cellWidth = screenWidth / 13;
        if( cellWidth > 45 ) {
            cellWidth = 45;
        }

        this.state = {cellSize:cellWidth};
        this.isCurrent = this.isCurrent.bind(this);
        this.renderDraggable = this.renderDraggable.bind(this);
        this.renderClickable = this.renderClickable.bind(this);
        this.renderCommon = this.renderCommon.bind(this);
        this.getStyle = this.getStyle.bind(this);
    }

    isCurrent = () => this.props.app.state.moveOtherTo 
        ? (this.props.position===this.props.app.state.moveOtherTo)
        : false;

    render() {

        const color = this.props.white ? "-white" : "-black";
        const className = this.props.type + color + " piece";

        return this.props.draggable
            ? (this.props.app.state.useDragAndDrop 
				? this.renderDraggable(className)
                 : this.renderClickable(className))
            : this.renderCommon(className);
    }

    renderClickable(className) { return <div className={className} 
        style={this.getStyle()}
		onClick={event => this.props.app.moveStart(this.props.position)} 
        ></div>;
    }

	renderDraggable(className) { return <Draggable type="piece" data={this.props.position} className={className}
        style={this.getStyle()}
    	onDragStart={val => this.props.app.moveStart(this.props.position)}></Draggable>;		
    }

	renderCommon(className) { return <div className={className}  style={this.getStyle()} >
    		<Motion defaultStyle={{opacity:1}} style={{opacity: spring(this.isCurrent() ? 1 : 0)}}>
        		{style => <div style={{opacity: !this.props.app.state.myMove ? 0 : style.opacity}} className="haze"></div>}
        	</Motion>
    	</div>;
    }

    getStyle = () => {
       const s =  this.state.cellSize + 'px';
       const bs = (this.state.cellSize * 6) + 'px ' + (this.state.cellSize * 2) + 'px ';
       return {
			backgroundSize: bs, 
            width: s, height: s
       };
    };
}
