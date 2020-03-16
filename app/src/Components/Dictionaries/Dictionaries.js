import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';
import { Card, CardHeader, CardBody, Button,
  ListGroup, ListGroupItem,
  Row, Col, UncontrolledCollapse, CardTitle, CardText } from 'reactstrap'

class Dictionaries extends Component {

  constructor(props) {
    super(props);

    this.state = {dictionaries: []};
    this.all_dictionaries();
    this.get_words_list = this.get_words_list.bind(this);
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
  /*
  split_words(words) {
    let list0, list1, list2;
    let index = 0;
    for (word in words){
      switch (index) {
        case 0: list0.append(word); break;
        case 1: list1.append(word); break;
        case 2: list2.append(word); break;
      }
      index++;
      if (index == 3) {
        index = 0;
      } 
      result = [];
      result.append(list0);
      result.append(list1);
      result.append(list2);
      return result;      
    }
  }
  */
  get_words_list(words) {
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
      <ListGroupItem key={dictionary.id}>
        <Card>
          <CardHeader>
            <Button color='primary' outline size='lg'>{dictionary.dictionary_name}</Button>
          </CardHeader>
          <CardBody>
            <CardTitle>{dictionary.description}</CardTitle>
            <CardText>Progress: TODO</CardText>  
            <Button outline id='words_togger' color='secondary' outline>Words</Button>
          </CardBody>              
        </Card>      
        <UncontrolledCollapse toggler='#words_togger'>
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
        <ListGroup horizontal='lg' className='w-50'>
          {dictionaries_list}          
        </ListGroup>
      </Container>
      );
  }
}
export default Dictionaries;