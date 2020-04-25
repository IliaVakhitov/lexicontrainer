import React from 'react';
import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';

class Error extends Component {

  render() {
    const error = this.props.location.state.error;
    
    return (
      <Container>
        <h3>Server Error</h3>
        <p>
          <code>{error}</code>
        </p>
      </Container>
    );
  }
}

export default withRouter(Error);