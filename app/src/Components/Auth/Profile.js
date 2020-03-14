import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      total_dictionaries: '',
      total_words: '',
      progress: '',
    }

    this.user_profile();
  }

  user_profile() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);    
    fetch('auth/user/',{
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        this.setState({
          total_dictionaries: data.total_dictionaries,
          total_words: data.total_words,
          progress: data.progress
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  

  render() {
    return (
      <Container>
        <h3>{this.props.username} user information</h3>
        <Container>
          <p>Dictionaries: {this.state.total_dictionaries}</p>
          <p>Total words: {this.state.total_words}</p>
          <p>Progres: {this.state.progress}</p>
        </Container>
      </Container>
      );
  }
}
export default Profile;