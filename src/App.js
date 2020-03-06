import React from 'react';
import { Component } from 'react';
import MyNavBar from './MyNavBar';
import TestComponent from './TestComponent';
import './App.css';

class App extends Component { 
  
  render() {
    return (
      <div>
        <MyNavBar/>        
        <TestComponent/>
      </div>
    );
  }
}
 
export default App;
