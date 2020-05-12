import React from 'react';
import { Component } from 'react';
import { Input, Button, Label, FormFeedback, 
  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; 

import Symonyms from './Symonyms';
import Definition from './Definition';
import WordDictionary from './WordDictionary';
import fetchData from '../../Utils/fetchData';
  
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
    this.fetchData = fetchData.bind(this);
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

  updateSynonyms(newSynonyms) {
    let synonyms = [];
    if (newSynonyms) {    
      newSynonyms.forEach(synonym => {
        synonyms.push(synonym.value);
      });
    }
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
    const body = JSON.stringify({
      'word_id': word_id
    });
    this.fetchData('/words/delete_word', 'DELETE', [], body)
      .then(() => {        
        this.props.onExit();
        this.props.showMessage('Word deleted!');
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
    const body = JSON.stringify({
      'dictionary_id': this.state.dictionaryId,
      'word_id': this.props.word.id,  
      'spelling': this.state.spelling,  
      'definition': this.state.definition,  
      'synonyms': this.state.synonyms  
    }); 
    this.fetchData('/words/update_word', 'POST', [], body)
      .then(() => {    
        this.setState({
          saved: true,
          progress: 0
        });  
        this.props.onExit(); 
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
        <Label className='my-1' for='spelling'>Spelling</Label>          
        <Input 
          id='spelling'
          invalid={!this.state.spelling}
          value={this.state.spelling}
          name='spelling' 
          id='spelling' 
          onChange={this.updateState}/>
        <FormFeedback>Please, fill out this field!</FormFeedback>      
        <Definition 
          updateDefinition={(value) => this.updateDefinition(value)}
          key={'definition'.concat(this.props.word.id)} 
          id={this.props.word.id}
          spelling={this.props.word.spelling}
          definition={this.props.word.definition} 
          definitions={this.props.word.all_definitions} 
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
          allSynonyms={this.props.word.all_synonyms} 
          synonyms={this.props.word.synonyms} 
        />  
        <WordDictionary 
          dictionaries={this.props.dictionaries}
          updateDictionary={value => this.updateDictionary(value)}
          id={this.props.word.id} 
          dictionaryName={this.props.word.dictionary_name}
          dictionaryId={this.state.dictionaryId}
        />  
        {this.props.isLoggedIn && 
          <div>         
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
              className='float-right mx-1 my-1'
              outline 
              onClick={this.showModal}
              color='danger'
            >
              Delete word
            </Button> 
          </div>   
        }  
        {!this.props.isLoggedIn &&   
          <Button 
            className='mx-1 my-1'
            outline
            olor="secondary" 
            onClick={this.cancelEdit}
          >
            Close
          </Button>
        }    
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
