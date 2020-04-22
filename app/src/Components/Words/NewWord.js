import React from 'react';
import { Component } from 'react';
import { Input,InputGroup, InputGroupAddon, InputGroupText, 
  Button, Collapse,PopoverHeader,PopoverBody, Popover } from 'reactstrap';

import Definition from './Definition';
import WordDictionary from './WordDictionary';

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionaryId: this.props.dictionaryId,
      showDictionary: isNaN(this.props.dictionaryId),
      spelling: '',
      definition: '',
      collapseOpen: false,
      popoverText: '',
      showPopover: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateDefinition = this.updateDefinition.bind(this);
    this.changeCollapseOpen = this.changeCollapseOpen.bind(this);
    this.showPopover = this.showPopover.bind(this);
  }


  changeCollapseOpen() {
    this.setState({
      spelling:'',
      definition:'',
      collapseOpen: !this.state.collapseOpen
    });  
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

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/add_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.dictionaryId,  
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
          spelling: '',
          definition: '',
        });
        this.props.updateList();
      },
      (error) => {
        console.log(error);
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
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'15%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>        
              <Input 
                invalid={!this.state.spelling}
                value={this.state.spelling}
                name='spelling'
                id='spelling'
                onChange={this.updateState} 
                placeholder='Type word or phrase '
              />
          </InputGroup>            
          <Definition 
            updateDefinition={(value) => this.updateDefinition(value)}
            key={'definition0'} 
            id={'newWord'}
            spelling={this.state.spelling}
            definition={this.state.definition} 
            definitions={[]}
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