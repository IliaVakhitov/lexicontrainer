import React from 'react';
import { Component } from 'react';
import { Alert, Container } from 'reactstrap'; 

class MyAlert extends Component {
 
  render() {
    return (    
      <Container>
        <Alert 
          isOpen={this.props.message !== ''} 
          toggle={this.props.hideMessage} 
          color='info'
          fade={false}
        >          
          {this.props.message}
        </Alert> 
      </Container>
    );
  }
}

export default MyAlert;