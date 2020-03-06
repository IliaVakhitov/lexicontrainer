import React from 'react';
import { Component } from 'react';
import MyNavBar from './MyNavBar';
import LoginForm from './LoginForm';
import TestComponent from './TestComponent';
import './App.css';

class App extends Component { 
  
  render() {
    return (
      <div>
        <MyNavBar/>     
        <LoginForm />   
        <TestComponent/>
      </div>
    );
  }
}
 
export default App;
