import React from 'react';
import { Component } from 'react';
import { Input, Button, InputGroupAddon, InputGroup, Container } from 'reactstrap';

class TestComponent extends Component {
  constructor(props){
    super(props);

    this.state = {
      request: "",
      requestResult: "No request" 
    };

    this.handleClick = this.handleClick.bind(this);

    this.updateState = this.updateState.bind(this);
  }

  updateState(e) {
    this.setState({
      request: e.target.value
    });
  }

  handleClick() {
    fetch('/'.concat(this.state.request))
      .then(res => res.json())
      .then(
      (data) => {
        console.log(data);
        this.setState({
          requestResult: "Success"
        });
      },
      (error) => {
        console.log(error);
        this.setState({requestResult: 'Error'})
      }
    );
  }
  
  render() {
    return (
      <Container>
        <br/>
        <InputGroup>
          <InputGroupAddon addonType="prepend">Request</InputGroupAddon>
          <Input id="request" type="text" placeholder="Enter request" onChange={this.updateState}/>          
          <InputGroupAddon addonType="append">            
            <Button onClick={this.handleClick}>Submit</Button>
          </InputGroupAddon>                    
        </InputGroup>
        <br/>
        <p id="result">{this.state.requestResult}</p>        
      </Container>
    );
  }
}

export default TestComponent;