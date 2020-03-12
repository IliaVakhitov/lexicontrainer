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

    this.login_check = this.login_check.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.login_check();
    
  }
 

  onLogin(new_token, new_username){
    this.setState({
      isLoggedIn: true,
      username: new_username,
      token: new_token});
  }

  logout() {
    console.log("logging out");
    fetch('/auth/logout',
      {method: 'POST'})
      .then(res => res.json())
      .then(
      (data) => {
        console.log(data);
        this.setState({
          isLoggedIn: false,
          username: 'Guest',
          token: null
        });
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  login_check() {
    fetch('/auth/is_authenticated')
      .then(res => res.json())
      .then(
      (data) => {
        console.log(data);
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
        <MyNavBar isLoggedIn={isLoggedIn} logout={this.logout}/>     
        <Routes token={this.state.token} username={this.state.username} onLogin={() => this.onLogin} />;
      </div>
    );
  }
}

export default App;
