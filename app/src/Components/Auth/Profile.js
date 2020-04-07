import React from 'react';
import { Component } from 'react';
import { Container, Spinner } from 'reactstrap';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      dictionaries: '',
      words: '',
      wordsLearned: '',
      progress: '',
      fetchInProgress: true
    }

    this._isMounted = false;

    
  }
  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.user_profile();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  user_profile() {
    this.setState({
      fetchInProgress: true
    });
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
          username: data.username,
          fetchInProgress: false
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          fetchInProgress: false
        });
      }
    );
    
  }
  

  render() {
    const fetchInProgress = this.state.fetchInProgress;
    return (      
        <Container>
          {fetchInProgress && 
            <Container>
              <h3>User information</h3>
              <Spinner type='grow' color='dark' />
            </Container>
            }
          {!fetchInProgress &&
           <Container>
            <h3>{this.state.username} user information</h3>            
            <p>Dictionaries: {this.state.dictionaries}</p>
            <p>Total words: {this.state.words}</p>
            <p>Words learned: {this.state.wordsLearned}</p>
            <p>Progres: {this.state.progress}%</p>
          </Container>
          }
        </Container>        
      );
  }
}
export default Profile;