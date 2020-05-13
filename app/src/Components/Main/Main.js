import React from 'react';
import { Component } from 'react';
import MyNavBar from './MyNavBar';
import Routes from './Routes';
import MyAlert from './MyAlert';

import fetchData from '../../Utils/fetchData';

class Main extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isLoggedIn: false,
      username: 'Guest',
      message: '',
      showMessage: false
    };

    this.onLogout = this.onLogout.bind(this);
    this.loginCheck = this.loginCheck.bind(this);
    this.onLogin = this.onLogin.bind(this);   
    this.showMessage = this.showMessage.bind(this);   
    this.hideMessage = this.hideMessage.bind(this);   
    this.fetchData = fetchData.bind(this);   
  }
 
  componentDidMount() {
    this.loginCheck();
    this.myInterval = setInterval(() => {
      this.hideMessage();
    }, 3000);
  }
  
  componentWillUnmount() {
    if (localStorage.getItem('rememberMe') !== 'true') {
      localStorage.clear();
    }
    clearInterval(this.myInterval);
  }

  onLogin(newUsername) {
    if (!newUsername) {
      return;
    }
    this.setState({
      isLoggedIn: true,
      username: newUsername
    });
    this.showMessage('Login successful!');
  }

  onLogout() {
    localStorage.clear();
    this.setState({
      isLoggedIn: false,
      username: 'Guest'      
    });
    this.showMessage('By!');
  }

  showMessage(message) {
  
    this.setState({
      message: message
    });
    clearInterval(this.myInterval);
    this.myInterval = setInterval(() => {
      this.hideMessage();
    }, 3000);
  
  }

  hideMessage() {
    this.setState({
      message: ''
    });
  }

  loginCheck() {
    const token = localStorage.getItem('token');
    if (token === null) {
      return;  
    }

    this.fetchData('/is_authenticated')
      .then((data) => {
        this.setState({
          isLoggedIn: data.is_authenticated,
          username: data.username
        });        
      }
    );   
  }

  render() {
    return (
      <div>
        <MyNavBar isLoggedIn={this.state.isLoggedIn}/>   
        <MyAlert 
          message={this.state.message} 
          hideMessage={this.hideMessage} 
        />
        <Routes 
          showMessage={(message) => this.showMessage(message)}
          username={this.state.username} 
          onLogout={() => this.onLogout} 
          onLogin={() => this.onLogin} 
        />        
      </div>
    );
  }
}

export default Main;
