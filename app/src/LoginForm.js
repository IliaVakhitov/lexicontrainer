import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  Form, Button } from 'reactstrap';

class LoginForm extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        isLoggedIn: false,
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
    this.setState({passsword: event.target.value});
  }
  
  handleSubmit(event) {
    event.preventDefault();
    fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'username': this.state.username,
        'password': this.state.password,
        'remember_me': false
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        console.log(data);
        this.setState({
          isLoggedIn: true
        });
      },
      (error) => {
        console.log(error);
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
              onChange={this.handleChangeUserame}/>
          </InputGroup>
          <br/>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input type="password" 
              placeholder="password"                
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