import React from 'react';
import { Component } from 'react';
import { Input,InputGroup, InputGroupAddon, InputGroupText, 
  Button, Card, CardBody, Collapse, Container } from 'reactstrap';

import Definition from './Definition';

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: '',
      collapseOpen: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateDefinition = this.updateDefinition.bind(this);
    this.changeCollapseOpen = this.changeCollapseOpen.bind(this);
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

  addNewWord() {
    if (!this.state.spelling) {
      return;
    }
    if (!this.state.definition) {
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/add_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.props.dictionaryId,  
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
        this.props.onSaveWord();
      },
      (error) => {
        console.log(error);
      }
    ); 
    
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
        <Button 
          className='my-1 mx-1' 
          outline 
          color='success'
          hidden={!this.state.collapseOpen}
          disabled={!this.state.spelling || ! this.state.definition}
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
                <InputGroupAddon style={{width:'11%'}} addonType='prepend'>
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
                   
              </Collapse>           
            
        
      </div>
    );
  }
}

export default NewWord;