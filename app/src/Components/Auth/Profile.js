import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      dictionaries: '',
      words: '',
      wordsLearned: '',
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
    fetch('auth/user',{
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          words: data.words,
          progress: data.progress,
          wordsLearned: data.words_learned,
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
          <p>Dictionaries: {this.state.dictionaries}</p>
          <p>Total words: {this.state.words}</p>
          <p>Words learned: {this.state.wordsLearned}</p>
          <p>Progres: {this.state.progress}%</p>
        </Container>
      </Container>
      );
  }
}
export default Profile;