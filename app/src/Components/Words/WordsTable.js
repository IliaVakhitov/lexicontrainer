import React from 'react';
import { Component } from 'react';
import { Container, Table } from 'reactstrap';

import Word from './Word';

class WordsTable extends Component {
  constructor(props) {
    super(props);
    
  }

  getWordsList() {
    let i = 1;
    const words = this.props.words;
    return words.map(word =>
      <Word 
        key={i}
        i={i++} 
        refresh={true}
        index={this.props.words.indexOf(word)} 
        onDeleteWord={this.props.onDeleteWord}
        word={word} />
      );
  }

  render() {
    return (
      <Container>
      <h4>Words</h4>
      <Table borderless responsive>
        <thead className='thead-light'>
          <tr>
            <th width={'5%'}>#</th>
            <th width={'25%'}>Spelling</th>
            <th width={'60%'}>Definition</th>
            <th width={'10%'}>Action</th>
          </tr>
        </thead>
        <tbody>
          {this.getWordsList()}
        </tbody>
      </Table>
      </Container>
    );
  }
}

export default WordsTable;