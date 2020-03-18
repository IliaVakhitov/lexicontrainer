import React from 'react';
import { Component } from 'react';
import { Container, Input } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Button,
 Table } from 'reactstrap';

import { withRouter } from 'react-router-dom';

class Dictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionary_id: this.props.location.state.dictionary_id,
      dictionary_name: '',
      dictionary_description: '',
      words: []
    };

    this.dictionary();
    
  }

  dictionary() {
    if (this.state.dictionary_id === NaN) {
      console.log(this.state.dictionary_id);
      //this.props.history.push('/dictionaries');
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);  
    myHeaders.append('dictionary_id', this.state.dictionary_id);  
    fetch('/dicts/dictionary', {
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
          dictionary_name: data.dictionary_name,
          dictionary_description: data.description,
          words: data.words
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  render() {
    let i = 1;
    const words_list = this.state.words.map(word =>
      <tr key={word.id}>
        <td>{i++}</td>
        <td><Input value={word.spelling} /></td>
        <td><Input value={word.definition} /></td>            
      </tr>
      );
    return (
      <Container>
        <div>
          <Button className='mx-1 my-1'>Save</Button>
          <Button className='mx-1 my-1'>Cancel</Button>
        </div>
        <br />
        <InputGroup>
          <InputGroupAddon addonType='prepend'>
            <InputGroupText>Name</InputGroupText>
          </InputGroupAddon>
          <Input
            type='text'
            value={this.state.dictionary_name}
            onChange={this.set_dictionary_name}
          />
        </InputGroup>
        <br />
        <InputGroup>
          <InputGroupAddon addonType='prepend'>
            <InputGroupText>Description</InputGroupText>
          </InputGroupAddon>        
          <Input
            type='text'
            value={this.state.dictionary_description}
            onChange={this.set_dictionary_description}
          />
        </InputGroup>
        <br />
        <Table borderless responsive>
          <thead className='thead-light'>
            <tr>
              <th>#</th>
              <th width={'35%'}>Spelling</th>
              <th width={'65%'}>Definition</th>
            </tr>
          </thead>
          <tbody>
            {words_list}
          </tbody>
        </Table>
      </Container>
    );
  }
}

export default withRouter(Dictionary);