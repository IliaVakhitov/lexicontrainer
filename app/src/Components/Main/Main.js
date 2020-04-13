import React from 'react';
import { Component } from 'react';
import { Container, Button, Row, Col } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import TestComponent from '../../TestComponent';

import NewWord from '../../Components/Words/NewWord';
import NewDictionary from '../../Components/Dictionaries/NewDictionary';

class Main extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      newDictionary: false,
      newWord: false  
    };
    this.handleClick = this.handleClick.bind(this);
    this.onSaveDictionary = this.onSaveDictionary.bind(this);
    this.onSaveWord = this.onSaveWord.bind(this);
  }

  handleClick(button) {
    this.props.history.push('/'.concat([button.target.name]));
  }

  onSaveDictionary() {
    // TODO
    // show message
    // TODO
    //this.props.history.push('/dictionaries');
  }
  
  
  onSaveWord() {
    // TODO
    // show message
    // TODO
    //this.props.history.push('/words');
  }
  

  render() {
    const username = this.props.username;
    const welcomeString = username !== '' ? 'Welcome, ' + username + '!' : 'Welcome!';

    return (
      <Container>
        <h3>{welcomeString}</h3>
        <TestComponent />
        <br />
        <Row xs='2'>
          <Col>
            <Button
              className='mx-1 my-1'
              name='words'
              outline
              color='dark'
              onClick={this.handleClick}
            >
              View words
            </Button>
          </Col>
          <Col>
            <Button
              className='mx-1 my-1'
              name='profile'
              outline
              color='dark'
              onClick={this.handleClick}
            >
              View profile
            </Button>
          </Col>          
        </Row>
        <Row xs='2'>
          <Col>
            <Button
              className='mx-1 my-1'
              name='dictionaries'
              outline
              color='dark'
              onClick={this.handleClick}
            >
              View dictionaries
            </Button>
          </Col>
          <Col>
          <Button
              className='mx-1 my-1'
              name='games'
              outline
              color='dark'
              onClick={this.handleClick}
            >
              Play revision game
            </Button>
            
          </Col>        
        </Row>
        <Row xs='1'>
          <Col>
            <NewDictionary 
              onSaveDictionary={this.onSaveDictionary}
            />
          </Col>
        </Row>
        <Row xs='1'>
          <Col>
            <NewWord 
              dictionary={null} 
              onSaveWord={this.onSaveWord}
            />
          </Col>
        </Row>
        <Row xs='1'>
          <Col>
            <h6>Random word</h6>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Main);