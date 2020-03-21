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
      words_learned: '',
      progress: '',
    }

    
  }
  componentDidMount() {
    this.user_profile();
  }
  
  user_profile() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));    
    fetch('auth/user/',{
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        this.setState({
          total_dictionaries: data.total_dictionaries,
          total_words: data.total_words,
          progress: data.progress,
          words_learned: data.words_learned,
          username: data.username
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
        <h3>{this.state.username} user information</h3>
        <Container>
          <p>Dictionaries: {this.state.total_dictionaries}</p>
          <p>Total words: {this.state.total_words}</p>
          <p>Words learned: {this.state.words_learned}</p>
          <p>Progres: {this.state.progress}%</p>
        </Container>
      </Container>
      );
  }
}
export default Profile;