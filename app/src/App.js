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
      username: 'Guest'
    };

    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);   
  }
 
  componentDidMount() {
    this.login_check();
  }

  onLogin(new_username) {
    this.setState({
      isLoggedIn: true,
      username: new_username});
  }

  onLogout() {
    this.setState({
      isLoggedIn: false,
      username: 'Guest'});
  }

  login_check() {
    fetch('/auth/is_authenticated')
      .then(res => res.json())
      .then(
      (data) => {
        if ('is_authenticated' in data && data.is_authenticated) {
          this.setState({
            isLoggedIn: data.is_authenticated,
            username: data.username
          });
          localStorage.setItem('token', data.token);
        } else {
          this.setState({
            isLoggedIn: false,
            username: 'Guest'
          });
          this.props.history.push('/login');
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
// 4. Edit word
// 5. Edit dictionary
// 6. Print statistic from statistic table