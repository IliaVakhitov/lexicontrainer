import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';

class Profile extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <h3>{this.props.username} information</h3>
      </Container>
      );
  }
}
export default Profile;