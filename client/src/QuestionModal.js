import React from 'react';
import { Button, Modal, ModalFooter } from 'reactstrap';

export default class QuestionModal extends React.Component {
  constructor(props) {
    super(props);

    this.surrender = this.surrender.bind(this);
    this.askDeuce = this.askDeuce.bind(this);
    this.acceptDeuce = this.acceptDeuce.bind(this);
    this.isModalOpen = this.isModalOpen.bind(this);
  }

  surrender() {
      this.props.app.setState({myMove:false, endGame:true, message:'You lose', askSurrender:false});
      this.props.app.mediatorClient.sendGameMessage( 
         this.props.app.state.player, this.props.app.state.otherPlayer, "SURRENDER",  "Your opponent just have surrendered. You win.");
  }

  askDeuce() {
      this.props.app.setState({myMove:false, askDeuce:false});
      this.props.app.mediatorClient.sendGameMessage(
        this.props.app.state.player, this.props.app.state.otherPlayer, "ASK_DEUCE");
  }

  acceptDeuce() {
      this.props.app.setState({myMove:false, confirmDeuce:false});
      this.props.app.deuce();
      this.props.app.mediatorClient.sendGameMessage(this.props.app.state.player, this.props.app.state.otherPlayer, "DEUCE");
  }

  isModalOpen() {
	return this.props.app.state.askSurrender || this.props.app.state.confirmDeuce || this.props.app.state.askDeuce;
  }

  render() {
    return (
        <Modal isOpen={this.isModalOpen()}>
          <ModalFooter>
            {this.props.app.state.askDeuce &&
               <Button color="primary" onClick={this.askDeuce}>Ask deuce</Button>
            }
            {this.props.app.state.confirmDeuce &&
               <Button color="primary" onClick={this.acceptDeuce}>Accept deuce</Button>
            }
            {this.props.app.state.askSurrender &&
               <Button color="primary" onClick={this.surrender}>Surrender</Button>
            }
            <Button color="secondary" onClick={()=> this.props.app.setState({askSurrender:false, askDeuce:false, confirmDeuce:false}) }>Cancel</Button>
          </ModalFooter>
        </Modal>
    );
  }
}
