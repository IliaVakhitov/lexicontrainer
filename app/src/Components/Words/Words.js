import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

import { ListGroup, ListGroupItem } from 'reactstrap';
import Word from './Word';

class Words extends Component {
  constructor(props) {
    super(props);

    this.state = {
      words: [],
      wordsRender: [],
      wordsRendered: 0,
      dictionaries: [],
      requestingData: false
    };
    
    this._isMounted = false;

    this.getWords = this.getWords.bind(this);
    this.getDictionaries = this.getDictionaries.bind(this);
    this.renderWords = this.renderWords.bind(this);

  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getWords();
    this._isMounted && this.getDictionaries();
    this.myInterval = setInterval(() => {
      this.renderWords();
    }, 500);
    // TODO 
    // get dictiId from props
    // get dict from props
  }

  getDictionaries() {
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
          words: data.words
        });
        
        
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  renderWords() {
    let wordsRendered = this.state.wordsRendered;
    if ( wordsRendered + 10 < this.state.words.length - 1) {
      wordsRendered += 10
    } else {
      wordsRendered = this.state.words.length - 1;
      clearInterval(this.myInterval);
    }
    this.setState({
      wordsRender: this.state.words.slice(0, wordsRendered),
      wordsRendered: wordsRendered
    })
  }

  render() {
    const listItems = this.state.wordsRender.map(word => 
        <ListGroupItem 
          key={word.id}
          style={{borderStyle: 'none'}}          
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
        <h3>All words</h3>
        <ListGroup>
          {listItems}          
        </ListGroup>
      </Container>
      );
  }
  
}


export default Words;

