import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  Form, Button } from 'reactstrap';

class LoginForm extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: "",
        password: "",
      }
      this.handleChangeUserame = this.handleChangeUserame.bind(this);
      this.handleChangePassword = this.handleChangePassword.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeUserame(event) {
    this.setState({username: event.target.value});
  }
  
  handleChangePassword(event) {
    this.setState({username: event.target.value});
  }
  
  handleSubmit(event) {
    fetch('/auth/login')
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
        <Form onSubmit={this.handleSubmit}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Username</InputGroupText>
            </InputGroupAddon>
            <Input placeholder="username" 
              value={this.state.username} 
              onChange={this.handleChangeUserame}/>
          </InputGroup>
          <br/>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input type="password" 
              placeholder="password" 
              value={this.state.username} 
              onChange={this.handleChangePassword}/>
          </InputGroup>
          <br/>
          <Button>Submit</Button>
        </Form>
      </Container>
    );
  }
}

export default LoginForm