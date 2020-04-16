import React from 'react';
import { Component } from 'react';
import { Modal, Button, 
  ModalHeader, ModalBody } from 'reactstrap'; 

import EditWord from './EditWord';
  
class Word extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false      
    };

    this.showModal = this.showModal.bind(this);
    this.onExit = this.onExit.bind(this);
    
  }

  onExit() {
    this.setState({
      modal: !this.state.modal      
    });
    this.props.updateList();  
  }

  showModal() {
    this.setState({
      modal: !this.state.modal      
    });
  }

  render() {    

    return ( 
      <div>       
        <h5 style={{ cursor: 'pointer' }} 
          onClick={this.showModal}
        >
          {this.props.word.spelling}{'  '}
          <i color='secondary' style={{fontSize:'15px'}}>{this.props.word.definition}{'. '}</i>
          <span style={{fontSize:'16px'}}>{'Progress: '}{this.props.word.progress}{'%'}</span>
        </h5>                  
        <Modal 
            size='lg'
            isOpen={this.state.modal} 
            toggle={this.showModal}
          >
          <ModalHeader toggle={this.showModal}>{this.props.word.spelling}</ModalHeader>
            <ModalBody>
              <EditWord  
                dictionaries={this.props.dictionaries}   
                updateList={this.props.updateList}
                onCancelEdit={this.showModal}
                word={this.props.word} 
                onExit={this.onExit}
              /> 
            </ModalBody>            
        </Modal>
      </div>
    );
  }
}

export default Word;
