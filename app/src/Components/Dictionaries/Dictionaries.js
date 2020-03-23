import React from 'react';
import { Component } from 'react';
import { Container, Input, 
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Card, CardHeader, CardBody, Button,
  ListGroup, ListGroupItem, Collapse,
  UncontrolledCollapse, CardTitle, CardText } from 'reactstrap'
import { withRouter } from 'react-router-dom';

class Dictionaries extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dictionaries: [], 
      newDictionaryName:'',
      newDictionaryDescription:'',
      addDictionary: false
    };

    this.allDictionaries();
    this.getWordsList = this.getWordsList.bind(this);
    this.updateState = this.updateState.bind(this);
    this.saveDictionary = this.saveDictionary.bind(this);
    this.addDictionary = this.addDictionary.bind(this);
    this.openDictionary = this.openDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
  }

  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  saveDictionary() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/add_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        dictionary_name: this.state.newDictionaryName,  
        dictionary_description: this.state.newDictionaryDescription,  
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
          newDictionaryName:'',
          newDictionaryDescription:'',
          addDictionary: false
        });
        this.allDictionaries();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  cancelEdit() {
    this.setState({
      newDictionaryName:'',
      newDictionaryDescription:'',
      addDictionary: false
    });  
  }

  addDictionary() {
    this.setState({
      addDictionary: !this.state.addDictionary
    });
  }

  allDictionaries() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries', {
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
        this.setState({dictionaries: data.dictionaries});
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  openDictionary(id) {
    this.props.history.push({
      pathname:'/dictionary', 
      state: { id: id }
    });
  }

  getWordsList(words) {
    if (words.length === 0) {
      return (<div>Nothing there! You can add new word!</div>);
    }
    const wordsList = words.map(word => 
      <Button 
        key={word.id}
        className='mx-1 my-1'  
        outline 
        color='dark'>
          {word.spelling}
      </Button>     
    );
    return (
      <div>
        {wordsList}        
      </div>
      
    );
  }

  render() {
    
    const dictionariesList = this.state.dictionaries.map(dictionary => 
      <ListGroupItem key={dictionary.id} className='w-50'>
        <Card>
          <CardHeader>
            <Button color='' outline 
              size='md' 
              className='w-100'
              onClick={() => this.openDictionary(dictionary.id)}>{dictionary.dictionary_name}</Button>
          </CardHeader>
          <CardBody>
            <CardTitle>{dictionary.description}</CardTitle>
            <CardText>Progress: TODO</CardText>  
            <Button outline 
              id={'words_togger'.concat(dictionary.id)} 
              color='info'>Words</Button>
          </CardBody>              
        </Card>      
        <UncontrolledCollapse toggler={'#words_togger'.concat(dictionary.id)}>
          <Card>
            <CardBody>
              {this.getWordsList(dictionary.words)}
            </CardBody>
          </Card>
        </UncontrolledCollapse>        
      </ListGroupItem>
    );

    return (
      <Container>
        <h3>Dictionaries</h3>
        <p>
          <Button outline 
            color='primary' 
            onClick={this.addDictionary}>
              Add new
          </Button>
        </p>
        <Collapse isOpen={this.state.addDictionary}>
          <Card className='w-100'>
          <CardBody>
              <InputGroup className='my-2'>
                <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                  <InputGroupText className='w-100'>Name</InputGroupText>
                </InputGroupAddon>                
                <Input 
                  type='text' 
                  value={this.state.newDictionaryName} 
                  name='newDictionaryName'
                  placeholder='Type name for new dictionary'
                  onChange={this.updateState}
                />
              </InputGroup>          
              <InputGroup className='my-2'>
                <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                  <InputGroupText className='w-100'>Description</InputGroupText>
                </InputGroupAddon>
                <Input 
                  type='text'
                  name='newDictionaryDescription' 
                  value={this.state.newDictionaryDescription} 
                  placeholder='Type description for new dictionary'
                  onChange={this.updateState}
                />
              </InputGroup>
              <Button outline 
                color='success' 
                className='mx-1 my-1'
                onClick={this.saveDictionary}>Save</Button>
              <Button outline 
                color='secondary' 
                className='mx-1 my-1'
                onClick={this.cancelEdit}>Cancel</Button>
            </CardBody>
          </Card>
        </Collapse>
        <ListGroup horizontal='lg'>
          {dictionariesList}          
        </ListGroup>
      </Container>
      );
  }
}
export default withRouter(Dictionaries);