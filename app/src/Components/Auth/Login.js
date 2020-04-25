import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, Container,
  FormGroup, Label, Form, Button } from 'reactstrap';

import { withRouter } from 'react-router-dom';
import fetchData from '../../Utils/fetchData';

class Login extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: '',
        password: '',
        showInvalid: false,
        rememberMe: false,
        loginError: false
      }
      this.updateState = this.updateState.bind(this);
      this.handleOnClickRememberMe = this.handleOnClickRememberMe.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleRegisterOnClick = this.handleRegisterOnClick.bind(this);
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      showInvalid: false
    });
  }

  handleOnClickRememberMe() {
    this.setState({rememberMe: !this.state.rememberMe});
  }

  handleRegisterOnClick() {
    this.props.history.push({
      pathname:'/register', 
      state: { username: this.state.username }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (! this.state.username
      || !this.state.password) {

      this.setState({
        showInvalid: true
      });
      return;
    }
    let myHeaders = new Headers();
    myHeaders.append('Authorization', 'Basic ' + btoa(this.state.username+':'+this.state.password));
    const body = JSON.stringify({
      username: this.state.username
    });
    this.fetchData('/auth/token', 'POST', myHeaders, body)
      .then((data) => {         
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
      }
    );      
  }

  render() {
    return (
      <Container>
        <Form onSubmit={this.handleSubmit}>
        <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Username</InputGroupText>
            </InputGroupAddon>
            <Input 
              invalid={this.state.loginError 
                || (this.state.showInvalid && !this.state.username)}
              placeholder='username'  
              value={this.state.username} 
              name='username'            
              onChange={this.updateState}/>
          </InputGroup>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Password</InputGroupText>
            </InputGroupAddon>
            <Input 
              type='password'
              invalid={this.state.loginError 
                || (this.state.showInvalid && !this.state.password)} 
              value={this.state.password} 
              name='password'                        
              placeholder='password'                
              onChange={this.updateState}/>
          </InputGroup>          
          <FormGroup check className='my-2'>
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
          <Button 
            outline
            className='mx-1 my-1'
          >
            Sing in
          </Button>
          <Button 
            className='mx-1 my-1'
            outline
            onClick={this.handleRegisterOnClick}
          >
            Register
          </Button>          
        </Form>
      </Container>
    );
  }
}

export default withRouter(Login);