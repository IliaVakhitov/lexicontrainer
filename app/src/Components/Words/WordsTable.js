import React from 'react';
import { Component } from 'react';
import { ListGroup} from 'reactstrap';

import Word from './Word';

class WordsTable extends Component {
  
  getWordsList() {
    const words = this.props.words;
    return words.map(word =>
      <Word 
        key={word.id}
        index={this.props.words.indexOf(word)} 
        onDeleteWord={this.props.onDeleteWord}
        word={word} />
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