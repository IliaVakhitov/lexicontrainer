import React from 'react';
import { Component } from 'react';
import { ListGroup,ListGroupItem } from 'reactstrap';

import Word from './Word';

class WordsTable extends Component {
  
  getWordsList() {
    const words = this.props.words;
    return words.map(word =>
      <ListGroupItem key={word.id}>
        <Word         
          onDeleteWord={this.props.onDeleteWord}
          word={word} />
      </ListGroupItem>
      );
  }

  render() {
    return (      
      <ListGroup>
        {this.getWordsList()}
      </ListGroup>      
    );
  }
}

export default WordsTable;