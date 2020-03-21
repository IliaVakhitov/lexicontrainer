import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  FormGroup, Label, Form, Button } from 'reactstrap';

class Login extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: '',
        password: '',
        remember_me: false
      }
      this.update_state = this.update_state.bind(this);
      this.handleOnClickRememberMe = this.handleOnClickRememberMe.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  update_state(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleOnClickRememberMe() {
    this.setState({remember_me: !this.state.remember_me});
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
        'remember_me': this.state.remember_me
      })
    })
      .then(res => res.json())
      .then((data) => {        
        if ('error' in data) {
          console.log(data);
          this.props.history.push('/login');
          return;
        }     
        localStorage.setItem('token', data.token);
        this.setState({
          username: '',
          password: ''
        });
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
              onChange={this.update_state}/>
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
              onChange={this.update_state}/>
          </InputGroup>
          <br/>
          <FormGroup check>
            <Label remember_me>
              <Input 
                type='checkbox' 
                value={this.state.remember_me} 
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

export default Login