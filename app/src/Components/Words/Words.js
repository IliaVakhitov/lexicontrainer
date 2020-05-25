import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import { ListGroup, ListGroupItem } from 'reactstrap';
import Word from './Word';
import NewWord from './NewWord';

import fetchData from '../../Utils/fetchData';

class Words extends Component {
  constructor(props) {
    super(props);

    this.state = {
      words: [],
      dictionaries: [],
      requestingData: false
    };
    
    this._isMounted = false;

    this.getWords = this.getWords.bind(this);
    this.getDictionaries = this.getDictionaries.bind(this);
    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getWords();
    this._isMounted && this.getDictionaries();
  }

  getDictionaries() {
    if (!isNaN(this.props.dictionaries)) {
      this.setState({
        dictionaries: this.props.dictionaries   
      });
      return;
    }
    this.setState({
      requestingData: true,
    });

    this.fetchData('/dictionaries_list')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          requestingData: false
        });
      }
    );  
  }

  getWords() {
    let body = JSON.stringify({});
    if (!isNaN(this.props.dictionaryId)) {      
      body = JSON.stringify({
        dictionary_id: this.props.dictionaryId
      });  
    }
    this.fetchData('/all_words', 'POST', [], body)
      .then((data) => {        
        this.setState({ 
          words: data.words,
          isLoggedIn: data.is_authenticated
        });
      }
    );   
  }

  render() {
    const listItems = this.state.words.map(word => 
        <ListGroupItem 
          key={word.id}          
        >  
          <Word  
            dictionaries={this.state.dictionaries}   
            updateList={this.getWords}
            word={word}
            isLoggedIn={this.state.isLoggedIn} 
            showMessage={(message) => this.props.showMessage(message)} 
          />            
        </ListGroupItem>        
    );
    
    return (
      
      <Container>
        <h3>Words</h3>
        {this.state.isLoggedIn && 
          <NewWord 
            dictionaryId={this.props.dictionaryId} 
            dictionaries={this.state.dictionaries}
            updateList={this.getWords}
            showMessage={(message) => this.props.showMessage(message)} 
          />
        }        
        <ListGroup>
          {listItems}          
        </ListGroup>
      </Container>
      );
  }
  
}


export default withRouter(Words);

