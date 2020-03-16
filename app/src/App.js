import React from 'react';
import { Component } from 'react';
import MyNavBar from './Components/Main/MyNavBar';
import Routes from './Components/Main/Routes';
import './App.css';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isLoggedIn: false,
      username: 'Guest',
      token: null
    };

    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.login_check();
    
  }
 

  onLogin(new_token, new_username) {
    this.setState({
      isLoggedIn: true,
      username: new_username,
      token: new_token});
  }

  onLogout() {
    this.setState({
      isLoggedIn: false,
      username: 'Guest',
      token: null});
  }

  login_check() {
    fetch('/auth/is_authenticated')
      .then(res => res.json())
      .then(
      (data) => {
        if ('is_authenticated' in data && data.is_authenticated) {
          this.setState({
            isLoggedIn: data.is_authenticated,
            username: data.username,
            token: data.token
          });
        } else {
          this.setState({
            isLoggedIn: false,
            username: 'Guest',
            token: null
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn
    return (
      <div>
        <MyNavBar isLoggedIn={isLoggedIn}/>     
        <Routes token={this.state.token} 
          username={this.state.username} 
          onLogout={() => this.onLogout} 
          onLogin={() => this.onLogin} />;
      </div>
    );
  }
}

export default App;
// TODO
// 1. Make standart fetch requests
// 2. Handle errors in requests on client side
// 3. Make available demo version, without login
// 4. Edit word
// 5. Edit dictionary
// 6. Print statistic from statistic table