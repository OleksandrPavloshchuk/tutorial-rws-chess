import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import PlayerListPage from './PlayerListPage';
import BoardPage from './BoardPage';
import GameService from '../services/gameService';

var gameService;

export default class App extends Component {
    constructor(props) {
        super(props);
        gameService = new GameService(this);
        this.state = {};
    }

    componentDidMount= () => {
        gameService.setInitialState();
        const screenWidth = this.elem.clientWidth;
        gameService.calculateCellSize(screenWidth);
    }

    render = () => <div className="container"
            ref={elem=>this.elem = elem}>
            {this.state.player
                ? this.state.otherPlayer
                    ? <BoardPage app={gameService} />
                    : <PlayerListPage app={gameService} />
                : <LoginPage app={gameService}/> }
        </div>;
}
