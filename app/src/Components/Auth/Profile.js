import React from 'react';
import { Component } from 'react';
import { Container, Spinner } from 'reactstrap';

import fetchData from '../../Utils/fetchData';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      dictionaries: '',
      words: '',
      wordsLearned: '',
      progress: '',
      requestingData: true
    }

    this._isMounted = false;

    this.fetchData = fetchData.bind(this);    
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
      requestingData: true
    });
    this.fetchData('/user')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          words: data.words,
          progress: data.progress,
          wordsLearned: data.words_learned,
          username: data.username,
          requestingData: false
        });
      }
    );
    
  }
  
  render() {
    const requestingData = this.state.requestingData;
    return (      
        <Container>
          {requestingData && 
            <Container>
              <h3>User information</h3>
              <Spinner type='grow' color='dark' />
            </Container>
            }
          {!requestingData &&
           <Container>
            <h3>{this.state.username}</h3>            
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