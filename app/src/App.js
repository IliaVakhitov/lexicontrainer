import React from 'react';
import { Component } from 'react';
import MyNavBar from './MyNavBar';
import LoginForm from './LoginForm';
import TestComponent from './TestComponent';
import './App.css';


class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isLoggedIn: false,
      token: null
    };

    this.login_check = this.login_check.bind(this);
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.login_check();
  }

  login(){
    console.log("logging in");
    // TODO
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
        if ('is_authenticated' in data) {
          this.setState({
            isLoggedIn: data.is_authenticated,
            token: data.token
          });
        } else {
          this.setState({
            isLoggedIn: false,
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
        <MyNavBar isLoggedIn={isLoggedIn}
          login={() => this.login()}   
          logout={() => this.logout()}/>     
          { (!this.state.isLoggedIn) ? (
            <LoginForm 
              isLoggedIn={isLoggedIn} 
              //login={() => this.login()}   
              //logout={() => this.logout()}
              />   
          ) : (          
          <TestComponent/>
          )}
      </div>
    );
  }
}



 
export default App;
