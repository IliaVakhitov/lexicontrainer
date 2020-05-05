import React from 'react';
import { Component } from 'react';

import fetchData from '../../Utils/fetchData';
import { Container } from 'reactstrap';

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
        this.props.history.push('/');    
      }
    ); 
  }  

  render() {
    return (
      <Container>
        Log out succeessful
      </Container>);
  }
}

export default Logout;