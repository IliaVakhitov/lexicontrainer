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
      dictionaries: [],
      requestingData: false  
    };

    this._isMounted = false;

    this.handleClick = this.handleClick.bind(this);
    this.onSaveDictionary = this.onSaveDictionary.bind(this);
    this.onSaveWord = this.onSaveWord.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getDictionaries();
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
  
  getDictionaries() {
    this.setState({
      requestingData: true,
    });

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries_list', {
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
          dictionaries: data.dictionaries,
          requestingData: false
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          requestingData: false
        });
      }
    );  
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
              dictionaryId={undefined}
              dictionaries={this.state.dictionaries}
              updateList={this.onSaveWord}
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