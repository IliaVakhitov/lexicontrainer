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
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));    
   
    fetch('/auth/logout',{
      method: 'POST',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
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