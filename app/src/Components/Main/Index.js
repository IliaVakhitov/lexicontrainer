import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import NewWord from '../Words/NewWord';
import NewDictionary from '../Dictionaries/NewDictionary';

import fetchData from '../../Utils/fetchData';

class Index extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      dictionaries: [],
      requestingData: false  
    };

    this._isMounted = false;

    this.handleClick = this.handleClick.bind(this);
    this.onSaveDictionary = this.onSaveDictionary.bind(this);
    this.onSaveWord = this.onSaveWord.bind(this);
    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getDictionaries();
  }

  handleClick(button) {
    this.props.history.push('/'.concat([button.target.name]));
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
  
  
  getDictionaries() {
    // TODO
    if (!this.props.isLoggedIn) {
      //return;
    }
    this.setState({
      requestingData: true,
    });

    this.fetchData('/dicts/dictionaries_list')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          requestingData: false
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
          {this.props.isLoggedIn && 
            <NewDictionary 
              onSaveDictionary={this.onSaveDictionary}
            />
          }
          {this.props.isLoggedIn && 
            <NewWord  
              dictionaryId={undefined}
              dictionaries={this.state.dictionaries}
              updateList={this.onSaveWord}
            />
          }
        <h6>Random word</h6>
        
      </Container>
    );
  }
}

export default withRouter(Index);