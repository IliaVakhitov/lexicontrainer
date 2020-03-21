import React from 'react';
import { Component } from 'react';
import { Redirect } from 'react-router-dom';

class Logout extends Component {
  constructor(props) {
    super(props);

    this.logout() 
  }

  logout() {
    console.log('logging out');
    fetch('/auth/logout',
      {method: 'POST'})
      .then(res => res.json())
      .then(
      (data) => {
        localStorage.removeItem('token');
        this.props.onLogout();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }  

  render() {
    return (<Redirect to='/' />);
  }
}

export default Logout;