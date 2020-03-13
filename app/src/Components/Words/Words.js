import React from 'react';
import { Component, ListItem } from 'react';
import { Button, Container } from 'reactstrap';
import { Card, CardHeader, CardBody,
  CardTitle, CardText } from 'reactstrap'

class Words extends Component {
  constructor(props) {
    super(props);

    this.state = {words: []};
    this.all_words();
  }

  all_words() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);  
    fetch('/words/all_words', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'username': this.props.username
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        console.log(data);
        this.setState({words: data.words});
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  render() {
    const listItems = this.state.words.map(word => 
      <Card key={word.id}>
        <CardHeader tag="h3">{word.spelling}</CardHeader>
        <CardBody>
          <CardTitle>{word.definition}</CardTitle>
          <CardText>Progress: {word.learning_index}</CardText>          
        </CardBody>        
      </Card>              
    );
    
    return (
      <Container>
        <h3>All words</h3>
        <ul>
          {listItems}          
        </ul>
      </Container>
      );
  }
}
export default Words;