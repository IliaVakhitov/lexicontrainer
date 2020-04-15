import React from 'react';
import { Component } from 'react';
import { Container, Input, InputGroup, 
  InputGroupAddon, InputGroupText, Button,
  FormFeedback, Spinner} from 'reactstrap'
import { withRouter } from 'react-router-dom';

import NewWord from '../../Components/Words/NewWord';
import WordsTable from '../../Components/Words/WordsTable';


class Dictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      id: this.props.location.state.id,
      description: '',
      dictionaries: [],
      requestingData: true,
      words: []
    };

    this._isMounted = false; 

    this.saveDictionary = this.saveDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateState = this.updateState.bind(this);
    this.dictionary = this.dictionary.bind(this);
    this.deleteDictionary = this.deleteDictionary.bind(this);
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

  dictionary() {
    this.setState({requestingData: true});
    if (isNaN(this.state.id)) {
      console.log('Incorrect dictionary id '.concat(this.props.location.state.id));
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
          words: data.words,
          namePopover: false,
          requestingData: false
        });        
      },
      (error) => {
        console.log(error);
      }
    );
    
  }

  deleteDictionary() {
    // TODO
    // Show confirmation
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/delete_dictionary', {
      method: 'DELETE',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.id
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

  saveDictionary() {
    if (!this.state.name) {
      this.setState({namePopover: true});
      return;
    }
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
    const requestingData = this.state.requestingData; 
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
          <Button outline 
            color='danger' 
            onClick={this.deleteDictionary}
            className='float-right mx-1 my-1'>Delete dictionary</Button>
        </div>
        {!requestingData &&
          <div>
            <InputGroup className='my-2'>
              <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                <InputGroupText className='w-100'>Name</InputGroupText>
              </InputGroupAddon>
              <Input
                invalid={!this.state.name}
                type='text'
                name='name'
                id='name'
                value={this.state.name}
                onChange={this.updateState}
              />
              <FormFeedback>Please, fill out this field!</FormFeedback>
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
            <NewWord 
              dictionaryId={this.state.id}
              dictionaries={this.state.dictionaries}
              dictionaryName={this.state.name}
              onSaveWord={this.dictionary}
            />  
          </div>
        }      
        <h4 className='my-3'>Words</h4>
        {requestingData && <Spinner type='grow' color='dark' />}
        <WordsTable 
          dictionaryName={this.state.name}
          dictionaryId={this.state.id}
          dictionaries={this.props.dictionaries}
          updateDictionary={this.dictionary}
          words={[]}
          onDeleteWord={this.dictionary}
        />
      </Container>
    );
  }
}

export default withRouter(Dictionary);
//words={this.state.words} 