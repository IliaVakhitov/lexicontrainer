import React from 'react';
import { Component } from 'react';
import { Input,Label, 
  Button, Collapse,PopoverHeader,PopoverBody, Popover } from 'reactstrap';

import Symonyms from './Symonyms';
import Definition from './Definition';
import WordDictionary from './WordDictionary';
import fetchData from '../../Utils/fetchData';

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionaryId: this.props.dictionaryId,
      showDictionary: isNaN(this.props.dictionaryId),
      spelling: '',
      definition: '',
      synonyms: [],
      collapseOpen: false,
      popoverText: '',
      showPopover: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateDefinition = this.updateDefinition.bind(this);
    this.changeCollapseOpen = this.changeCollapseOpen.bind(this);
    this.showPopover = this.showPopover.bind(this);
    this.fetchData = fetchData.bind(this);
  }


  changeCollapseOpen() {
    this.setState({
      spelling:'',
      definition:'',
      collapseOpen: !this.state.collapseOpen
    });  
    if ('isOpen' in this.props) {
      this.props.isOpen(!this.state.collapseOpen);
    }
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  showPopover(show) {
    let popoverText = '';
    let hasEmpty = false;
    if (!this.state.spelling) {
      popoverText = 'spelling'
      hasEmpty = true;
    }
    if (!this.state.definition) {
      popoverText += (popoverText !== '' ? ', ' : '');
      popoverText += 'definition';
      hasEmpty = true;
    }
    if (!this.state.dictionaryId) {
      popoverText += (popoverText !== '' ? ', ' : '');
      popoverText += 'dictionary';
      hasEmpty = true;
    }
    popoverText = 'Please, fill out ' + popoverText + '!';
    this.setState({
      showPopover: show && hasEmpty,
      popoverText: popoverText
    });
  }

  addNewWord() {
    if (!this.state.spelling) {
      return;
    }
    if (!this.state.definition) {
      return;
    }
    if (isNaN(this.state.dictionaryId)) {
      console.log('Dictionary id is ' + this.state.dictionaryId)
      return;
    }
    const body = JSON.stringify({
      'dictionary_id': this.state.dictionaryId,  
      'spelling': this.state.spelling,  
      'definition': this.state.definition,
      'synonyms': this.state.synonyms
    });
    this.fetchData('/add_word', 'POST', [], body)
      .then(() => {        
        this.setState({
          spelling: '',
          definition: '',
          synonyms: []
        });
        this.props.updateList();
        this.props.showMessage('Word saved!');
      }
    );     
  }

  updateDictionary(id) {
    this.setState({ 
      dictionaryId: id
    });
  }

  updateDefinition(definition) {
    this.setState({
      definition: definition
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
    });     
  }

  render() {
    return (
      <div>
        <Button 
          outline 
          className='my-1 mx-1' 
          color='info' 
          hidden={this.state.collapseOpen}
          onClick={this.changeCollapseOpen}
        >
          Add new word
        </Button>
        <Collapse isOpen={this.state.collapseOpen}>
          <Popover
            placement='top'
            isOpen={this.state.showPopover}
            target='btnSave'
          >
            <PopoverHeader>
              Empty fields
            </PopoverHeader>
            <PopoverBody>
              {this.state.popoverText}
            </PopoverBody>
          </Popover>
          <Button 
            className='my-1 mx-1' 
            outline 
            id='btnSave'
            onMouseOver={() => this.showPopover(true)}
            onMouseLeave={() => this.showPopover(false)}
            color='success'
            hidden={!this.state.collapseOpen}
            disabled={!this.state.spelling 
              || ! this.state.definition 
              || (isNaN(this.state.dictionaryId))
            }
            onClick={this.addNewWord}
          >
            Save
          </Button> 
          <Button 
            outline 
            color='secondary' 
            className='mx-1 my-1'
            hidden={!this.state.collapseOpen}
            onClick={this.changeCollapseOpen}
          >
            Cancel
          </Button>
          <br/>
          <Label className='my-1'for='spelling'>Spelling</Label>
          <Input 
            invalid={!this.state.spelling}
            value={this.state.spelling}
            name='spelling'
            id='spelling'
            onChange={this.updateState} 
            placeholder='Type word or phrase '
          />
          
          <Definition 
            updateDefinition={(value) => this.updateDefinition(value)}
            key={'definition'.concat(this.state.spelling)}
            id='newDefinition'
            spelling={this.state.spelling}
            definition={this.state.definition} 
            definitions={[]}
          />  
          <Symonyms 
            updateSynonyms={(value) => this.updateSynonyms(value)}
            key={'synonyms0'.concat(this.state.spelling)}
            id='newSynonyms'
            spelling={this.state.spelling}
            allSynonyms={[]} 
            synonyms={[]} 
          />  
          {this.state.showDictionary &&
            <WordDictionary
              id={0}
              dictionaryName={this.props.dictionaryName}
              dictionaryId={this.props.dictionaryId}
              dictionaries={this.props.dictionaries}
              updateDictionary={value => this.updateDictionary(value)}
            />
          }
        </Collapse>           
      </div>
    );
  }
}

export default NewWord;