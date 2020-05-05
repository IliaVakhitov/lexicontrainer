import React from 'react';
import { Component } from 'react';
import MyNavBar from './MyNavBar';
import Routes from './Routes';

import fetchData from "../../Utils/fetchData";

class Main extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isLoggedIn: false,
      username: 'Guest'
    };

    this.onLogout = this.onLogout.bind(this);
    this.loginCheck = this.loginCheck.bind(this);
    this.onLogin = this.onLogin.bind(this);   
    this.fetchData = fetchData.bind(this);   
  }
 
  componentDidMount() {
    this.loginCheck();
  }
  
  componentWillUnmount() {
    if (localStorage.getItem('rememberMe') !== 'true') {
      localStorage.clear();
    }
  }

  onLogin(newUsername) {
    this.setState({
      isLoggedIn: true,
      username: newUsername
    });
  }

  onLogout() {
    localStorage.clear();
    this.setState({
      isLoggedIn: false,
      username: 'Guest'
    });
  }

  loginCheck() {
    const token = localStorage.getItem('token');
    if (token === null) {
      return;  
    }

    this.fetchData('/auth/is_authenticated')
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
        <Routes 
          username={this.state.username} 
          onLogout={() => this.onLogout} 
          onLogin={() => this.onLogin} 
        />;
      </div>
    );
  }
}

export default Main;
