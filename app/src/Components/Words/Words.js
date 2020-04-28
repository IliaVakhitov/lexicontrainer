import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

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

    this.fetchData('/dicts/dictionaries_list')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
          requestingData: false
        });
      }
    );  
  }

  getWords() {
    
    let myHeaders = [];
    if (!isNaN(this.props.dictionaryId)) {      
      myHeaders.push({
        'name':'dictionary_id', 
        'value' : this.props.dictionaryId
      });  
    }
    this.fetchData('/words/all_words', 'GET', myHeaders)
      .then((data) => {        
        this.setState({ 
          words: data.words,
          wordsRender: [],
          wordsRendered: 0      
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
          />            
        </ListGroupItem>        
    );
    
    return (
      
      <Container>
        <NewWord 
          dictionaryId={this.props.dictionaryId} 
          dictionaries={this.state.dictionaries}
          updateList={this.getWords}
        />
        <h3>Words</h3>
        <ListGroup>
          {listItems}          
        </ListGroup>
      </Container>
      );
  }
  
}


export default Words;

