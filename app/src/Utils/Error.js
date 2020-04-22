import React from 'react';
import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';

class Error extends Component {

  render() {
    // TODO
    return (      
      <Container>
        Error occurred!
      </Container>
    );
  }
}

export default withRouter(Error);