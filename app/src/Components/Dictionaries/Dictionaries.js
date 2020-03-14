import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';
import { Card, CardHeader, CardBody,
  CardTitle, CardText } from 'reactstrap'

class Dictionaries extends Component {

  constructor(props) {
    super(props);

    this.state = {dictionaries: []};
    this.all_dictionaries();
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

  render() {

    const listItems = this.state.dictionaries.map(dictionary => 
      <Card key={dictionary.id}>
        <CardHeader tag="h3">{dictionary.dictionary_name}</CardHeader>
        <CardBody>
          <CardTitle>{dictionary.description}</CardTitle>
          <CardText>Progress: TODO</CardText>          
        </CardBody>        
      </Card>              
    );

    return (
      <Container>
        <h3>Dictionaries</h3>
        <ul>
          {listItems}          
        </ul>
      </Container>
      );
  }
}
export default Dictionaries;