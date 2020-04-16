import React from 'react';
import { Component } from 'react';
import { Input, Button, 
  InputGroup, InputGroupAddon, InputGroupText,
  FormFeedback, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; 

import Symonyms from './Symonyms';
import Definition from './Definition';
import WordDictionary from './WordDictionary';
  
class EditWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionaryId: null,
      spelling: '',
      definition: '',
      progress: 0,
      synonyms: '',
      saved: true,
      modal: false
    };

    this.updateState = this.updateState.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.saveWord = this.saveWord.bind(this);
    this.updateDefinition = this.updateDefinition.bind(this); 
    this.updateSynonyms = this.updateSynonyms.bind(this); 
    this.updateDictionary = this.updateDictionary.bind(this); 
    this.showModal = this.showModal.bind(this); 
  }

  componentDidMount() {
    this.setState({
      dictionaryId: this.props.word.dictionary_id,
      spelling: this.props.word.spelling,
      definition: this.props.word.definition,
      progress: this.props.word.progress
    });
    
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      saved: false,
    });
  }

  updateDefinition(definition) {
    this.setState({ 
      definition: definition,
      saved: false
    });     
  }

  updateSynonyms(synonyms) {
    this.setState({ 
      synonyms: synonyms,
      saved: false
    });     
  }

  updateDictionary(id) {
    this.setState({ 
      dictionaryId: id,
      updateDictionary: true,
      saved: false
    });
  }

  deleteWord(word_id) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/delete_word', {
      method: 'DELETE',
      headers: myHeaders,
      body: JSON.stringify({
        'word_id': word_id
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.props.onExit();
      },
      (error) => {
        console.log(error);
      }
    );       
  }

  cancelEdit() {
    this.props.onCancelEdit();
  }

  saveWord() {

    if (this.state.saved === true) {
      this.props.onExit();
      return;
    }
    if (!this.state.spelling) {
      return;
    }
    if (!this.state.definition) {
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/update_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.dictionaryId,
        'word_id': this.props.word.id,  
        'spelling': this.state.spelling,  
        'definition': this.state.definition  
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }    
        this.setState({
          saved: true,
          progress: 0
        });  
        this.props.onExit(); 
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  showModal() {
    this.setState({
      modal: !this.state.modal      
    });
  }

  render() {    

    return ( 
      <div>
        <InputGroup >
          <InputGroupAddon  style={{width:'15%'}} addonType='prepend'>
            <InputGroupText className='w-100'>Spelling</InputGroupText>
          </InputGroupAddon>         
          <Input 
            invalid={!this.state.spelling}
            value={this.state.spelling}
            name='spelling' 
            id='spelling' 
            onChange={this.updateState}/>
          <FormFeedback>Please, fill out this field!</FormFeedback>
        </InputGroup>            
        <Definition 
          updateDefinition={(value) => this.updateDefinition(value)}
          key={'definition'.concat(this.props.word.id)} 
          id={this.props.word.id}
          spelling={this.props.word.spelling}
          definition={this.props.word.definition} 
          definitions={this.props.word.definitions} 
        />  
        <span               
          hidden={this.state.definition}
          style={{color:'#e63b45', fontSize:'13px'}}
        >
          Please, fill out this field!
        </span>        
        <Symonyms 
          updateSynonyms={(value) => this.updateSynonyms(value)}
          key={'synonyms'.concat(this.props.word.id)} 
          id={this.props.word.id}
          spelling={this.props.word.spelling}
          synonyms={this.props.word.synonyms} 
        />  
        <WordDictionary 
          dictionaries={this.props.dictionaries}
          updateDictionary={value => this.updateDictionary(value)}
          id={this.props.word.id} 
          dictionaryName={this.props.word.dictionary_name}
          dictionaryId={this.state.dictionaryId}
        />           
        <Button 
          className='mx-1 my-1'
          outline
          color='success'
          onClick={this.saveWord}
        >
          Save
        </Button>
        <Button 
          className='mx-1 my-1'
          outline
          olor="secondary" 
          onClick={this.cancelEdit}
        >
          Cancel
        </Button>      
        <Button 
          className='float-right'
          outline 
          onClick={this.showModal}
          color='danger'
        >
          Delete word
        </Button>            
        <Modal isOpen={this.state.modal} toggle={this.showModal}>
            <ModalHeader>Delete word {this.state.spelling}?</ModalHeader>
            <ModalBody>This cannot be undone!</ModalBody>
            <ModalFooter>
              <Button 
                outline
                className='mx-1 my-1'
                color='danger' 
                onClick={() => this.deleteWord(this.props.word.id)}
              >
                Delete
              </Button>
              <Button 
                outline
                className='mx-1 my-1'
                color='secondary' onClick={this.showModal}>Cancel</Button>
            </ModalFooter>
          </Modal>
      </div>
    );
  }
}

export default EditWord;
