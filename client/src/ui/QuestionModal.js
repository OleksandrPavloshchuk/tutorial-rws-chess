import React from 'react';
import { Button, Modal, ModalFooter } from 'reactstrap';

import '../assets/css/QuestionModal.css';

export default function QuestionModal(props) {	
	const dispatch = actionType => props.app.dispatch({type:actionType});

   	return (
       	<Modal isOpen={props.app.isConfirm()} className="modal-narrow" >
			<ModalFooter className="modal-footer-center">
          		{props.app.getState().askDeuce &&
           		<Button color="outline-danger" onClick={e => dispatch("UI_DEUCE")}>Ask deuce</Button>
           		}
          		{props.app.getState().confirmDeuce &&
           		<Button color="outline-primary" onClick={e => dispatch("UI_ACCEPT_DEUCE")}>Accept deuce</Button>
           		}
           		{props.app.getState().askResign &&
           		<Button color="outline-danger" onClick={e => dispatch("UI_RESIGN")}>Resign</Button>
           		}
           		<Button color="outline-secondary" onClick={e => dispatch("UI_CANCEL")}>Cancel</Button>
       		</ModalFooter>
      	</Modal>
    );
}
