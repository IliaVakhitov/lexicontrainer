import React from 'react';
import { Component } from 'react';
import { Container, Input, Label,
  FormFeedback, Spinner, Button,
  Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { withRouter } from 'react-router-dom';

import Words from '../../Components/Words/Words';
import fetchData from '../../Utils/fetchData';

class Dictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      requestingData: true,
      modal: false
    };

    this._isMounted = false; 

    this.saveDictionary = this.saveDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateState = this.updateState.bind(this);
    this.dictionary = this.dictionary.bind(this);
    this.deleteDictionary = this.deleteDictionary.bind(this);
    this.showModal = this.showModal.bind(this);
    this.fetchData = fetchData.bind(this);
  }
  
  componentDidMount() {
    this._isMounted = true; 
    this._isMounted && this.dictionary();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      namePopover: false
    });
  }

  cancelEdit() {
    this.props.history.push('/dictionaries');
  }

  showModal() {
    this.setState({
      modal: !this.state.modal      
    });
  }
  
  dictionary() {
    this.setState({ requestingData: true });
    if (isNaN(this.props.location.state.id)) {
      console.log('Incorrect dictionary id '.concat(this.props.location.state.id));
      this.props.history.push('/dictionaries');
    }
    
    let myHeaders = [];
    myHeaders.push({
      'name': 'dictionary_id',
      'value': this.props.location.state.id
    });

    this.fetchData('/dictionary', 'GET', myHeaders)
      .then((data) => {         
        this.setState({
          name: data.dictionary_name,
          description: data.description,
          namePopover: false,
          requestingData: false,
          isLoggedIn: data.is_authenticated
        });        
      }
    );    
  }

  deleteDictionary() {
    const body = JSON.stringify({
      'dictionary_id': this.props.location.state.id
    })
    this.fetchData('/delete_dictionary', 'DELETE', [], body) 
      .then(() => {                
        this.props.history.push('/dictionaries');
        this.props.showMessage('Dictionary deleted!');
      }
    ); 
  }

  saveDictionary() {
    if (!this.state.name) {
      this.setState({namePopover: true});
      return;
    }
    const body = JSON.stringify({
      'dictionary_id': this.props.location.state.id,  
      'dictionary_name': this.state.name,  
      'description': this.state.description
    });
    this.fetchData('/update_dictionary', 'POST', [], body) 
      .then(() => {                
        this.props.history.push('/dictionaries');
        this.props.showMessage('Dictionary saved!');
      },
    );  
  }

  render() {
    const requestingData = this.state.requestingData; 
    return (
      <Container>
        <div>
          {this.state.isLoggedIn && 
          <div>
            <Button outline 
              color='success' 
              onClick={this.saveDictionary}
              className='mx-1 my-1'
            >
              Save
            </Button>
            <Button outline 
              color='secondary' 
              onClick={this.cancelEdit}
              className='mx-1 my-1'
            >
              Cancel
            </Button>         
            <Button outline 
                color='danger' 
                onClick={this.showModal}
                className='float-right mx-1 my-1'
              >
                Delete dictionary
              </Button>
            </div>
          }
          {!this.state.isLoggedIn &&   
            <Button outline 
              color='secondary' 
              onClick={this.cancelEdit}
              className='mx-1 my-1'
            >
              Close
            </Button>
          }
          <Modal isOpen={this.state.modal} toggle={this.showModal}>
            <ModalHeader>Delete dictionary {this.state.name}?</ModalHeader>
            <ModalBody>This cannot be undone!</ModalBody>
            <ModalFooter>
              <Button 
                outline
                className='mx-1 my-1'
                color='danger' 
                onClick={this.deleteDictionary}
              >
                Delete
              </Button>
              <Button 
                outline
                className='mx-1 my-1'
                color='secondary' 
                onClick={this.showModal}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </div>
        {!requestingData &&
          <div>
            <Label className='my-1' for='name'>Name</Label>
            <Input
              invalid={!this.state.name}
              type='text'
              name='name'
              id='name'
              value={this.state.name}
              onChange={this.updateState}
            />
            <FormFeedback>Please, fill out this field!</FormFeedback>
            <Label className='my-1' for='description'>Description</Label>
            <Input
              type='text'
              name='description'
              value={this.state.description}
              onChange={this.updateState}
            />  
            <br/>        
          </div>          
        }      
        {requestingData && <Spinner type='grow' color='dark' />}
        <Words 
          dictionaryName={this.state.name}
          dictionaryId={this.props.location.state.id}
          dictionaries={this.props.dictionaries}
          updateDictionary={this.dictionary}
          onDeleteWord={this.dictionary}
          showMessage={(message) => this.props.showMessage(message)} 
        />
      </Container>
    );
  }
}

export default withRouter(Dictionary);
