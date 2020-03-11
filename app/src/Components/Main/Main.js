import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';
import TestComponent from '../../TestComponent';

class Main extends Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <Container>
        <h3>Welcome, {this.props.username}!</h3>
        <TestComponent />
      </Container>
      );
  }
}
export default Main;