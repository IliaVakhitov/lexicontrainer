import React from 'react';
import { Component } from 'react';
import { Input, Label, Container, Form, Button } from 'reactstrap';

import { withRouter } from 'react-router-dom';

import fetchData from '../../Utils/fetchData';

class Register extends Component {
  constructor(props) {
      super(props);
    
      this.state = {
        username: '',
        password: '',
        secretQuestion: '',
        secretAnswer: '',
        showInvalid: false
      }
      this.updateState = this.updateState.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this.setState({
      username: (this.props.location.state !== null ? this.props.location.state.username : '')
    });
  }
  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    
    if (! this.state.username
      || !this.state.password
      || ! this.state.secretQuestion
      || ! this.state.secretAnswer) {

      this.setState({
        showInvalid: true
      });
      return;
    }
    
    const body = JSON.stringify({
      username: this.state.username,
      password: this.state.password,
      secret_question: this.state.secretQuestion,
      secret_answer: this.state.secretAnswer
    });
    
    this.fetchData('/register', 'POST', [], body)
      .then((data) => {        
        localStorage.setItem('token', data.token);        
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
            invalid={this.state.showInvalid && !this.state.username}
            placeholder='username'  
            value={this.state.username} 
            name='username'            
            onChange={this.updateState}
          />
          <Label for='password' className='my-1'>Password</Label>
          <Input 
            id='password'
            invalid={this.state.showInvalid && !this.state.password}
            type='password' 
            value={this.state.password} 
            name='password'                        
            placeholder='password'                
            onChange={this.updateState}
          />
          <Label for='secretQuestion' className='my-1'>Secret question</Label>
          <Input 
            id='secretQuestion'
            placeholder='secret question' 
            invalid={this.state.showInvalid && !this.state.secretQuestion} 
            value={this.state.secretQuestion} 
            name='secretQuestion'            
            onChange={this.updateState}
          />
          <Label for='secretAnswer' className='my-1'>Secret answer</Label>
          <Input 
            id='secretAnswer'
            type='password' 
            invalid={this.state.showInvalid && !this.state.secretAnswer} 
            value={this.state.secretAnswer} 
            name='secretAnswer'                        
            placeholder='secret answer'                
            onChange={this.updateState}
          />
          <Button className='my-2' outline>Register</Button>
        </Form>
      </Container>
    );
  }
}

export default withRouter(Register);