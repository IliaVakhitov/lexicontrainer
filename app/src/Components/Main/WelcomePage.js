import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';
import TestComponent from '../../TestComponent';

class Welcome extends Component {
  render() {
    return (
      <Container>
        <h3>Welcome, {this.props.username}!</h3>
        <TestComponent />
      </Container>
      );
  }
}
export default Welcome;