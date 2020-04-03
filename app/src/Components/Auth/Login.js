import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  FormGroup, Label, Form, Button } from 'reactstrap';

import { withRouter } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: '',
        password: '',
        rememberMe: false
      }
      this.updateState = this.updateState.bind(this);
      this.handleOnClickRememberMe = this.handleOnClickRememberMe.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleOnClickRememberMe() {
    this.setState({rememberMe: !this.state.rememberMe});
  }

  handleSubmit(event) {
    event.preventDefault();
    // TODO validate form data
    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Basic ' + btoa(this.state.username+':'+this.state.password));
    myHeaders.append('Content-Type', 'application/json');
    fetch('/auth/token', {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({
        username: this.state.username
      })
    })
      .then(res => res.json())
      .then((data) => {        
        if ('error' in data) {
          console.log(data);
          this.props.history.push('/login');
          return;
        } 
        this.setState({
          username: '',
          password: ''
        });    
        localStorage.setItem('token', data.token);
        if (this.state.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }        
        this.props.onLogin(data.username);
        this.props.history.push('/');
        
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
            <InputGroupAddon addonType='prepend'>
              <InputGroupText>Username</InputGroupText>
            </InputGroupAddon>
            <Input placeholder='username'  
              value={this.state.username} 
              name='username'            
              onChange={this.updateState}/>
          </InputGroup>
          <br/>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input type='password' 
              value={this.state.password} 
              name='password'                        
              placeholder='password'                
              onChange={this.updateState}/>
          </InputGroup>
          <br/>
          <FormGroup check>
            <Label for='rememberMe'>
              <Input 
                name='remeber_me'
                id='remeber_me'
                type='checkbox' 
                value={this.state.rememberMe} 
                onClick={this.handleOnClickRememberMe}/>{' '}
              Remember me
            </Label>
          </FormGroup>
          <br/>
          <Button>Sing in</Button>
        </Form>
      </Container>
    );
  }
}

export default withRouter(Login);