import React from 'react';
import { Component } from 'react';
import { Input, InputGroupAddon, InputGroup, InputGroupText, 
  Container, Form, Button } from 'reactstrap';

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
    
    this.fetchData('/auth/register', 'POST', [], body)
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
          <InputGroup className='my-2'>
            <InputGroupAddon addonType='prepend' style={{width:'12%'}}>
              <InputGroupText className='w-100'>Username</InputGroupText>
            </InputGroupAddon>
            <Input 
              invalid={this.state.showInvalid && !this.state.username}
              placeholder='username'  
              value={this.state.username} 
              name='username'            
              onChange={this.updateState}/>
          </InputGroup>
          <InputGroup className='my-2'>
            <InputGroupAddon addonType='prepend' style={{width:'12%'}}>
              <InputGroupText className='w-100'>Password</InputGroupText>
            </InputGroupAddon>
            <Input 
              invalid={this.state.showInvalid && !this.state.username}
              type='password' 
              value={this.state.password} 
              name='password'                        
              placeholder='password'                
              onChange={this.updateState}/>
          </InputGroup>
          <InputGroup className='my-2'>
            <InputGroupAddon addonType='prepend' style={{width:'12%'}}>
              <InputGroupText className='w-100'>Secret question</InputGroupText>
            </InputGroupAddon>
            <Input 
              placeholder='secret question' 
              invalid={this.state.showInvalid && !this.state.secretQuestion} 
              value={this.state.secretQuestion} 
              name='secretQuestion'            
              onChange={this.updateState}/>
          </InputGroup>
          <InputGroup className='my-2'>
            <InputGroupAddon addonType='prepend' style={{width:'12%'}}>
              <InputGroupText className='w-100'>Secret answer</InputGroupText>
            </InputGroupAddon>
            <Input 
              type='password' 
              invalid={this.state.showInvalid && !this.state.secretAnswer} 
              value={this.state.secretAnswer} 
              name='secretAnswer'                        
              placeholder='secret answer'                
              onChange={this.updateState}/>
          </InputGroup>          
          <Button outline>Register</Button>
        </Form>
      </Container>
    );
  }
}

export default withRouter(Register);