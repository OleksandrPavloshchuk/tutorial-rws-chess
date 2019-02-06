import React from 'react';
import { Button, Modal, ModalFooter } from 'reactstrap';

import './assets/css/QuestionModal.css';

export default class QuestionModal extends React.Component {
  constructor(props) {
    super(props);

    this.surrender = this.surrender.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
    this.acceptDeuce = this.acceptDeuce.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  surrender() {
      this.props.app.setState({myMove:false, endGame:true, message:'You lose', askSurrender:false});
      this.props.app.sendGameMessage({what:"SURRENDER",  text:"Your opponent just have surrendered. You win."});
  }

  askDeuce() {
      this.props.app.setState({askDeuce:false});
      this.props.app.sendGameMessage({what:"ASK_DEUCE"});
  }

  acceptDeuce() {
      this.props.app.setState({myMove:false, confirmDeuce:false});
      this.props.app.deuce();
      this.props.app.sendGameMessage({what:"DEUCE"});
  }

  cancel = () => this.props.app.setState({askSurrender:false, askDeuce:false, confirmDeuce:false});

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
            {this.props.app.state.askSurrender &&
               <Button color="outline-danger" onClick={this.surrender}>Surrender</Button>
            }
            <Button color="outline-secondary" onClick={this.cancel}>Cancel</Button>
          </ModalFooter>
        </Modal>
    );
  }
}
