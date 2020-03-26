import React from 'react';
import { Component } from "react";
import { Input,InputGroup, InputGroupAddon, InputGroupText, Button,
  InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Card, CardBody } from 'reactstrap';

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newWordSpelling: '',
      newWordDefinition: '',
      newWordDefinitions: [],
      newWordGetButtonVisible: false,
      newWordSplitButtonOpen: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeNWSplitBtnOpen = this.changeNWSplitBtnOpen.bind(this);
    this.changeNWGetBtnVisible = this.changeNWGetBtnVisible.bind(this);
    this.getNewWordDefitions = this.getNewWordDefitions.bind(this);
    
  }



  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  changeNWGetBtnVisible(isVisible) {
    this.setState({newWordGetButtonVisible: isVisible});
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
        'spelling': this.state.newWordSpelling,  
        'definition': this.state.newWordDefinition
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
          newWordSpelling: '',
          newWordDefinition: '',
        });
        this.props.addNewWord();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  changeNWSplitBtnOpen() {
    this.setState({newWordSplitButtonOpen: !this.state.newWordSplitButtonOpen});
  }

  getNewWordDefitions() {

    this.setState({newWordSplitButtonOpen: !this.state.newWordSplitButtonOpen});
  }

  render() {
    return (
      <Card 
        onFocus={() => this.changeNWGetBtnVisible(true)}
        onBlur={() => this.changeNWGetBtnVisible(false)}>
        <CardBody>
          <h5>New word</h5>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>        
              <Input 
                value={this.state.newWordSpelling}
                name='newWordSpelling'
                onChange={this.updateState} 
                placeholder='Type word or phrase '
              />
          </InputGroup>            
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Definition</InputGroupText>
            </InputGroupAddon>        
            {this.state.newWordGetButtonVisible &&  
              <InputGroupButtonDropdown                   
                addonType='prepend'
                isOpen={this.state.newWordSplitButtonOpen} 
                toggle={this.getNewWordDefitions}>
                <DropdownToggle caret outline>
                  Get
                </DropdownToggle>
                <DropdownMenu>         
                  <DropdownItem>Some definition</DropdownItem>         
                </DropdownMenu>
              </InputGroupButtonDropdown>
            }
            <Input 
              name='newWordDefinition'
              onChange={this.updateState}                 
              value={this.state.newWordDefinition}
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