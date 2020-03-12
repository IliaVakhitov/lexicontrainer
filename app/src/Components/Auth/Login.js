import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  Form, Button } from 'reactstrap';

class Login extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: "",
        password: "",
      }
      this.handleChangeUsername = this.handleChangeUsername.bind(this);
      this.handleChangePassword = this.handleChangePassword.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeUsername(event) {
    this.setState({username: event.target.value});
  }
  
  handleChangePassword(event) {
    this.setState({password: event.target.value});
  }
  
  handleSubmit(event) {
    event.preventDefault();
    // TODO validate form data
    console.log("logging in");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", 'Basic ' + btoa(this.state.username+":"+this.state.password));
    myHeaders.append("Content-Type", 'application/json');
    fetch('/auth/token', {
      method: 'POST',
      credentials: "include",
      headers: myHeaders,
      body: JSON.stringify({
        'message':'Authorization request'
      })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        if ('token' in data) {          
          this.setState({
            username: "",
            password: ""
          });
          this.props.onLogin(data.token, data.username);
        }
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
              value={this.state.username}             
              onChange={this.handleChangeUsername}/>
          </InputGroup>
          <br/>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input type="password" 
              value={this.state.password}             
              placeholder="password"                
              onChange={this.handleChangePassword}/>
          </InputGroup>
          <br/>
          <Button>Sing in</Button>
        </Form>
      </Container>
    );
  }
}

export default Login