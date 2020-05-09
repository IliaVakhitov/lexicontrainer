import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import NewWord from '../Words/NewWord';
import NewDictionary from '../Dictionaries/NewDictionary';

import fetchData from '../../Utils/fetchData';
import RandomWords from '../Words/RandomWords';

class Index extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      dictionaries: [],
      requestingData: false,
      isOpenNewDictionary: false,  
      isOpenNewWord: false,
      isLoggedIn: false  
    };

    this._isMounted = false;

    this.onSaveDictionary = this.onSaveDictionary.bind(this);
    this.onSaveWord = this.onSaveWord.bind(this);
    this.getDictionaries = this.getDictionaries.bind(this);
    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getDictionaries();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onSaveDictionary() {
    // TODO
    // show message
    // TODO
    //this.props.history.push('/dictionaries');
  }
  
  
  onSaveWord() {
    // TODO
    // show message
    // TODO
    //this.props.history.push('/words');
  }
  
  isOpenNewDictionary(value) {
    this.setState({
      isOpenNewDictionary: value
    });
  }

  isOpenNewWord(value) {
    this.setState({
      isOpenNewWord: value
    });
  }

  getDictionaries() {
    this.setState({
      requestingData: true,
    });

    this.fetchData('/dicts/dictionaries_list')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          requestingData: false,
          isLoggedIn: this.props.username !== 'Guest'
        })        
      }
    );  
  }

  render() {
    const welcomeString = this.props.username !== '' 
      ? 'Welcome, ' + this.props.username + '!' : 
      'Welcome!';

    return (
      <Container>
        <h3>{welcomeString}</h3>
          {this.state.isLoggedIn && !this.state.isOpenNewWord &&
            <NewDictionary 
              onSaveDictionary={this.onSaveDictionary}
              isOpen={(value) => this.isOpenNewDictionary(value)}
            />
          }
          {this.state.isLoggedIn && !this.state.isOpenNewDictionary &&
            <NewWord  
              dictionaryId={undefined}
              dictionaries={this.state.dictionaries}
              updateList={this.onSaveWord}
              isOpen={(value) => this.isOpenNewWord(value)}
            />
          }
        <RandomWords />        
      </Container>
    );
  }
}

export default withRouter(Index);