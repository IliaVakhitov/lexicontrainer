import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

import { ListGroup, ListGroupItem } from 'reactstrap';
import Word from './Word';
import NewWord from './NewWord';

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

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries_list', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.setState({
          dictionaries: data.dictionaries,
          requestingData: false
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          requestingData: false
        });
      }
    );  
  }

  getWords() {
    
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token')); 
    if (!isNaN(this.props.dictionaryId)) {
      myHeaders.append('dictionary_id', this.props.dictionaryId);  
    }
    fetch('/words/all_words', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }
        this.setState({ 
          words: data.words,
          wordsRender: [],
          wordsRendered: 0      
        });
      },
      (error) => {
        console.log(error);
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

