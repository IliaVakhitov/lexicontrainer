import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';
import TestComponent from '../../TestComponent';

class Main extends Component {
  
  render() {
    const username = this.props.username;
    const welcomeString = username !== '' ? 'Welcome, ' + username + '!' : 'Welcome!';

    return (
      <Container>
        <h3>{welcomeString}</h3>
        <TestComponent />
      </Container>
    );
  }
}

export default Main;