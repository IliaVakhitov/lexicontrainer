import React from 'react';
import { Component } from 'react';
import { Input, Label, Container, FormGroup, Form, Button } from 'reactstrap';

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
      this.fetchData = fetchData.bind(this);

      this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
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
    let myHeaders = [];
    myHeaders.push({
      'name': 'Authorization', 
      'value': 'Basic ' + btoa(this.state.username+':'+this.state.password)
    });
    const body = JSON.stringify({
      username: this.state.username
    });
    this.fetchData('/token', 'POST', myHeaders, body)
      .then((data) => {      
        if ('error' in data) {
          this.setState({
            loginError: true  
          });
          return;
        }       
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
          <Label for='username' className='my-1'>Username</Label>
          <Input 
            id='username'
            invalid={this.state.loginError 
              || (this.state.showInvalid && !this.state.username)}
            placeholder='username'  
            value={this.state.username} 
            name='username'            
            onChange={this.updateState}
          />
          <Label for='password' className='my-1'>Password</Label>
          <Input 
            id='password'
            type='password'
            invalid={this.state.loginError 
              || (this.state.showInvalid && !this.state.password)} 
            value={this.state.password} 
            name='password'                        
            placeholder='password'                
            onChange={this.updateState}
          />
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