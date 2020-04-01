import React from 'react';
import { Component } from 'react';
import { Container, Input, InputGroup, InputGroupAddon, InputGroupText, Button,
  InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Table } from 'reactstrap';

import { withRouter } from 'react-router-dom';

import NewWord from '../../Components/Words/NewWord';
import WordsTable from '../../Components/Words/WordsTable';


class Dictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.location.state.id,
      name: '',
      description: '',
      words: []
    };

    this.saveDictionary = this.saveDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateState = this.updateState.bind(this);
    this.dictionary = this.dictionary.bind(this);
  }
  
  componentDidMount() {
    this.dictionary();
  }

  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }


  dictionary() {
  
    if (isNaN(this.state.id)) {
      console.log('Incorrect dictionary id '.concat(this.state.id));
      this.props.history.push('/dictionaries');
    }
    
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    myHeaders.append('dictionary_id', this.state.id);  
    fetch('/dicts/dictionary', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }         
        this.setState({
          name: data.dictionary_name,
          description: data.description,
          words: data.words
        });        
      },
      (error) => {
        console.log(error);
      }
    );
    
  }

  saveDictionary() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/update_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.id,  
        'dictionary_name': this.state.name,  
        'description': this.state.description
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.props.history.push('/dictionaries');
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  cancelEdit() {
    this.props.history.push('/dictionaries');
  }

  

  render() {
     
    return (
      <Container>
        <div>
          <Button outline 
            color='success' 
            onClick={this.saveDictionary}
            className='mx-1 my-1'>Save</Button>
          <Button outline 
            color='secondary' 
            onClick={this.cancelEdit}
            className='mx-1 my-1'>Cancel</Button>
        </div>
        <InputGroup className='my-2'>
          <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
            <InputGroupText className='w-100'>Name</InputGroupText>
          </InputGroupAddon>
          <Input
            type='text'
            name='name'
            value={this.state.name}
            onChange={this.updateState}
          />
        </InputGroup>
        <InputGroup className='my-2'>
          <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
            <InputGroupText className='w-100'>Description</InputGroupText>
          </InputGroupAddon>        
          <Input
            type='text'
            name='description'
            value={this.state.description}
            onChange={this.updateState}
          />
        </InputGroup>
        <br />
        <NewWord 
          dictionaryId={this.state.id} 
          addNewWord={this.dictionary}/>
        <WordsTable 
          words={this.state.words} 
          onDeleteWord={this.dictionary}
        />
        </Container>
    );
  }
}

export default withRouter(Dictionary);