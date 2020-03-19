import React from 'react';
import { Component } from 'react';
import { Container, CardFooter, Input, 
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
      new_dictionary_name:'',
      new_dictionary_description:'',
      add_dictionary: false
    };

    this.all_dictionaries();
    this.get_words_list = this.get_words_list.bind(this);
    this.update_state = this.update_state.bind(this);
    this.save_dictionary = this.save_dictionary.bind(this);
    this.add_dictionary = this.add_dictionary.bind(this);
    this.open_dictionary = this.open_dictionary.bind(this);
    this.cancel_edit = this.cancel_edit.bind(this);
  }

  update_state(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  set_new_dictionary_name(event) {
    this.setState({new_dictionary_name: event.target.value});
  }

  set_new_dictionary_description(event) {
    this.setState({new_dictionary_description: event.target.value});
  }

  save_dictionary() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);  
    fetch('/dicts/add_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        dictionary_name: this.state.new_dictionary_name,  
        dictionary_description: this.state.new_dictionary_description,  
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
          new_dictionary_name:'',
          new_dictionary_description:'',
          add_dictionary: false
        });
        this.all_dictionaries();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  cancel_edit() {
    this.setState({
      new_dictionary_name:'',
      new_dictionary_description:'',
      add_dictionary: false
    });  
  }

  add_dictionary() {
    this.setState({
      add_dictionary: !this.state.add_dictionary
    });
  }

  all_dictionaries() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);  
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

  open_dictionary(dictionary_id) {
    this.props.history.push({
      pathname:'/dictionary', 
      state: { dictionary_id: dictionary_id }
    });
  }

  get_words_list(words) {
    if (words.length == 0) {
      return (<div>Nothing there! You can add new word!</div>);
    }
    const words_list = words.map(word => 
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
        {words_list}        
      </div>
      
    );
  }

  render() {
    
    const dictionaries_list = this.state.dictionaries.map(dictionary => 
      <ListGroupItem key={dictionary.id} className='w-50'>
        <Card>
          <CardHeader>
            <Button color='' outline 
              size='md' 
              className='w-100'
              onClick={() => this.open_dictionary(dictionary.id)}>{dictionary.dictionary_name}</Button>
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
              {this.get_words_list(dictionary.words)}
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
            onClick={this.add_dictionary}>
              Add new
          </Button>
        </p>
        <Collapse isOpen={this.state.add_dictionary}>
          <Card className='w-50'>
          <CardBody>
              <InputGroup className='my-2'>
                <InputGroupAddon  addonType='prepend'>
                  <InputGroupText>Name</InputGroupText>
                </InputGroupAddon>                
                <Input 
                  type='text' 
                  value={this.state.new_dictionary_name} 
                  name='new_dictionary_name'
                  placeholder='Type name for new dictionary'
                  onChange={this.update_state}
                />
              </InputGroup>          
              <InputGroup className='my-2'>
                <InputGroupAddon addonType='prepend'>
                  <InputGroupText>Description</InputGroupText>
                </InputGroupAddon>
                <Input 
                  type='text'
                  name='new_dictionary_description' 
                  value={this.state.new_dictionary_description} 
                  placeholder='Type description for new dictionary'
                  onChange={this.update_state}
                />
              </InputGroup>
              <Button outline 
                color='success' 
                className='mx-1 my-1'
                onClick={this.save_dictionary}>Save</Button>
              <Button outline 
                color='secondary' 
                className='mx-1 my-1'
                onClick={this.cancel_edit}>Cancel</Button>
            </CardBody>
          </Card>
        </Collapse>
        <ListGroup horizontal='lg'>
          {dictionaries_list}          
        </ListGroup>
      </Container>
      );
  }
}
export default withRouter(Dictionaries);