import React, { Component } from 'react';

// TODO use retired pieces here

export default class RetiredPieces extends Component {

  render() {
    return (
        <div className="card retired-pieces">
          <div className="card-body">
            <div class="col-sm">
              <WhitePieces />
              <BlackPieces />
              TODO: is this necessary?
            </div>
          </div>
        </div>
    );
  }
}

class WhitePieces extends Component {
  render() {
    return (
        <div className="row">
          <div className="pawn-white"></div>
          <div className="bishop-white"></div>
          <div className="knight-white"></div>
          <div className="rook-white"></div>
          <div className="queen-white"></div>
          <div className="king-white"></div>
        </div>
    );
  }
}

class BlackPieces extends Component {
  render() {
    return (
        <div className="row">
          <div className="pawn-black"></div>
          <div className="bishop-black"></div>
          <div className="knight-black"></div>
          <div className="rook-black"></div>
          <div className="queen-black"></div>
          <div className="king-black"></div>
        </div>
    );
  }
}
