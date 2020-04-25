import React from 'react';
import { Component } from 'react';
import { Redirect } from 'react-router-dom';

import fetchData from '../../Utils/fetchData';

class Logout extends Component {
  constructor(props) {
    super(props);

    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this.logout();
  }

  logout() {
    this.fetchData('/auth/logout', 'POST')
      .then(() => {
        this.props.onLogout();        
      }
    ); 
  }  

  render() {
    return (<Redirect to='/' />);
  }
}

export default Logout;