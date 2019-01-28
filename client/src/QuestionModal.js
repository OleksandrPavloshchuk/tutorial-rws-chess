import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class QuestionModal extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.surrender = this.surrender.bind(this);
    this.deuce = this.deuce.bind(this);
  }

  toggle() {
//	let t = this.props.app.state.question;
//    this.props.app.setState({question:false; questionText:undefined});
  }

  surrender() {
      this.props.app.setState({myMove:false, endGame:true, message:'You lose', askSurrender:false});
      this.props.app.mediatorClient.sendGameMessage( 
         this.props.app.state.player, this.props.app.state.otherPlayer, "SURRENDER",  "Your opponent just have surrendered. You win.");
  }

  deuce() {
      this.props.app.setState({myMove:false, askDeuce:false});
      this.props.app.mediatorClient.sendGameMessage(
        this.props.app.state.player, this.props.app.state.otherPlayer, "ASK_DEUCE");
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.props.app.state.askSurrender || this.props.app.state.askDeuce} toggle={this.toggle} >
          <ModalHeader toggle={this.toggle}>Confirmation</ModalHeader>
          <ModalBody>{this.props.app.state.questionText}</ModalBody>
          <ModalFooter>
            {this.props.app.state.askDeuce &&
               <Button color="primary" onClick={this.deuce}>OK</Button>
            }
            {this.props.app.state.askSurrender &&
               <Button color="primary" onClick={this.surrender}>OK</Button>
            }
            <Button color="secondary" onClick={()=>    this.props.app.setState({askSurrender:false, askDeuce:false}) }>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
