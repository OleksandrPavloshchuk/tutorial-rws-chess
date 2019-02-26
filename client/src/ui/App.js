import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';   
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import GameService from '../services/gameService';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.gameService = new GameService(this);  
        this.state = {};      
    }

    componentDidMount() {
        this.gameService.setInitialState();
        const screenWidth = this.elem.clientWidth;
        this.gameService.calculateCellSize(screenWidth);
    }
    
    render() {

        return (
        <div className="container"
             ref={elem=>this.elem = elem}>
            {this.state.player
                ? this.state.otherPlayer 
                    ? <BoardPage app={this.gameService} /> 
                    : <PlayerListPage app={this.gameService} />
                : <LoginPage app={this.gameService}/> }
        </div>);
    }
}
