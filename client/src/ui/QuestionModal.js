import React from 'react';
import { Button, Modal, ModalFooter } from 'reactstrap';

import '../assets/css/QuestionModal.css';

export default class QuestionModal extends React.Component {
  constructor(props) {
    super(props);

    this.resign = this.resign.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
    this.acceptDeuce = this.acceptDeuce.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  resign() {
      this.props.app.setState({myMove:false, endGame:true, message:'You lose', askResign:false});
      this.props.app.sendGameMessage({type:"RESIGN",  text:"Your opponent just have resigned. You win."});
  }

  askDeuce() {
      this.props.app.setState({askDeuce:false});
      this.props.app.sendGameMessage({type:"ASK_DEUCE"});
  }

  acceptDeuce() {
      this.props.app.setState({myMove:false, confirmDeuce:false});
      this.props.app.deuce();
      this.props.app.sendGameMessage({type:"DEUCE"});
  }

  cancel = () => this.props.app.setState({askResign:false, askDeuce:false, confirmDeuce:false});

  render() {
    return (
        <Modal isOpen={this.props.app.isConfirm()} className="modal-narrow" >
          <ModalFooter className="modal-footer-center">
            {this.props.app.state.askDeuce &&
               <Button color="outline-danger" onClick={this.askDeuce}>Ask deuce</Button>
            }
            {this.props.app.state.confirmDeuce &&
               <Button color="outline-primary" onClick={this.acceptDeuce}>Accept deuce</Button>
            }
            {this.props.app.state.askResign &&
               <Button color="outline-danger" onClick={this.resign}>Resign</Button>
            }
            <Button color="outline-secondary" onClick={this.cancel}>Cancel</Button>
          </ModalFooter>
        </Modal>
    );
  }
}
