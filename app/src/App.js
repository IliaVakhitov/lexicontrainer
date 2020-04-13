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
      username: ''
    };

    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);   
  }
 
  componentDidMount() {
    this.login_check();
  }
  
  componentWillUnmount() {
    if (localStorage.getItem('rememberMe') !== 'true') {
      localStorage.clear();
    }
  }

  onLogin(newUsername) {
    this.setState({
      isLoggedIn: true,
      username: newUsername});
  }

  onLogout() {
    localStorage.clear();
    this.setState({
      isLoggedIn: false,
      username: 'Guest'});
  }

  login_check() {
    const token = localStorage.getItem('token');
    if (token === null) {
      this.setState({
        isLoggedIn: false,
        username: 'Guest'
      });
      return;  
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + token);    
    fetch('auth/is_authenticated',{
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        } 
        if ('is_authenticated' in data && data.is_authenticated) {
          this.setState({
            isLoggedIn: data.is_authenticated,
            username: data.username
          });          
        } else {
          localStorage.removeItem('token')
          this.setState({
            isLoggedIn: false,
            username: 'Guest'
          });
        }
      },
      (error) => {
        console.log(error);
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
// 4. Print statistic from statistic table