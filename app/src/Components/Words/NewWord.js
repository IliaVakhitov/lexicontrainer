import React from 'react';
import { Component } from 'react';
import { Input,InputGroup, InputGroupAddon, InputGroupText, Button,
  InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Card, CardBody } from 'reactstrap';

import { getDefinitionAPI } from './Word'

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: '',
      definitions: [],
      getVisible: false,
      splitOpen: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.setGetVisible = this.setGetVisible.bind(this);
    this.getDefinitions = this.getDefinitions.bind(this);    
  }

  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  setGetVisible(isVisible) {
    this.setState({getVisible: isVisible});
  }

  getDefinitions() {
    this.setState({splitOpen: !this.state.splitOpen});
  }

  addNewWord() {
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
        this.props.onAddingNewWord();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  render() {
    return (
      <Card 
        onFocus={() => this.setGetVisible(true)}
        >
        <CardBody>
          <h5>New word</h5>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>        
              <Input 
                value={this.state.spelling}
                name='spelling'
                onChange={this.updateState} 
                placeholder='Type word or phrase '
              />
          </InputGroup>            
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Definition</InputGroupText>
            </InputGroupAddon>        
            {this.state.getVisible &&  
              <InputGroupButtonDropdown                   
                addonType='prepend'
                isOpen={this.state.splitOpen} 
                toggle={this.getDefinitions}>
                <DropdownToggle caret outline>
                  Get
                </DropdownToggle>
                <DropdownMenu>         
                  <DropdownItem>Some definition</DropdownItem>         
                </DropdownMenu>
              </InputGroupButtonDropdown>
            }
            <Input 
              name='definition'
              onChange={this.updateState}                 
              value={this.state.definition}
              placeholder='Defition of new word'
            />
          </InputGroup>     
          <Button outline color='success'
            onClick={this.addNewWord}
          >Add
          </Button>        
        </CardBody>       
      </Card>
    );
  }
}

export default NewWord;