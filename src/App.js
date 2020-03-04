import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    fetch('hello').then(res => res.json()).then(data => {setCurrentMessage(data.message);});
  },[]);

  return (
    <div className="App">
      <h3>{currentMessage}</h3>
    </div>
  );
}

export default App;
