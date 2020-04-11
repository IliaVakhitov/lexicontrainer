import React from 'react';
import { Component } from 'react';
import { Input,InputGroup, InputGroupAddon, InputGroupText, 
  Button, Card, CardBody } from 'reactstrap';

import Definition from './Definition';

class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: ''
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateDefinition = this.updateDefinition.bind(this);
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
        this.props.addNewWord();
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
      <Card>
        <CardBody>
          <Button outline color='primary'
            disabled={!this.state.spelling || ! this.state.definition}
            onClick={this.addNewWord}>
            Add new word
          </Button> 
          
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'11%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>        
              <Input 
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
        </CardBody>       
      </Card>
    );
  }
}

export default NewWord;