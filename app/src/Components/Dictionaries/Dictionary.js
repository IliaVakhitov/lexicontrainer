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
      description: '',
      words: [],
      updated_words: [],
      new_word_spelling: '',
      new_word_definition: ''
    };

    this.dictionary();
    this.save_dictionary = this.save_dictionary.bind(this);
    this.update_state = this.update_state.bind(this);
    this.cancel_edit = this.cancel_edit.bind(this);
    this.add_new_word = this.add_new_word.bind(this);
    this.update_word = this.update_word.bind(this);
    this.save_word = this.save_word.bind(this);
    setInterval(() => {
      this.save_words();
    }, 3000);
  }

  dictionary() {
    if (this.state.id === NaN) {
      console.log(this.state.id);
      //this.props.history.push('/dictionaries');
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
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
          description: data.description,
          words: data.words
        });
        
      },
      (error) => {
        console.log(error);
      }
    );
  }

  delete_word(word_id) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/delete_word', {
      method: 'DELETE',
      headers: myHeaders,
      body: JSON.stringify({
        'word_id': word_id
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.dictionary();
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  add_new_word() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/add_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.dictionary_id,  
        'spelling': this.state.new_word_spelling,  
        'definition': this.state.new_word_definition  
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.setState({
          new_word_spelling: '',
          new_word_definition: ''  
        });
        this.dictionary();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  update_word(index, event) {
    let new_words = this.state.words;
    let updated_words = this.state.updated_words;
    updated_words.push(index);
    new_words[index][event.target.name] = event.target.value;
    this.setState({
      words: new_words,
      updated_words: updated_words
    });
  }

  save_words() {
    let updated_words = this.state.updated_words;
    while (updated_words.length>0) {
      this.save_word(updated_words.pop());
    }
  }

  save_word(index) {
    const word = this.state.words[index];
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/update_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'word_id': word.id,  
        'spelling': word.spelling,  
        'definition': word.definition  
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.dictionary();
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  save_dictionary() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/update_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.dictionary_id,  
        'dictionary_name': this.state.dictionary_name,  
        'description': this.state.description,  
        'words': this.state.words  
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.props.history.push('/dictionaries');
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  cancel_edit() {
      this.props.history.push('/dictionaries');
  }

  update_state(event) {
    this.setState({[event.target.name]: event.target.value});
  } 

  render() {
    let i = 1;
    const words_list = this.state.words.map(word =>
      <tr key={word.id}>
        <td>{i++}</td>
        <td>
          <Input 
            value={word.spelling}
            name='spelling' 
            onChange={(event) => this.update_word(
              this.state.words.indexOf(word), event
            )}
          />
        </td>
        <td>
          <Input 
            value={word.definition}
            name='definition'
            onChange={(event) => this.update_word(
              this.state.words.indexOf(word), event
            )}
          />
        </td>
        <td>
          <Button outline 
            onClick={() => this.delete_word(word.id)}
            color='danger'>{String.fromCharCode(0x2015)}
          </Button>
        </td>
      </tr>
      );
    return (
      <Container>
        <div>
          <Button outline 
            color='success' 
            onClick={this.save_dictionary}
            className='mx-1 my-1'>Save</Button>
          <Button outline 
            color='secondary' 
            onClick={this.cancel_edit}
            className='mx-1 my-1'>Cancel</Button>
        </div>
        <InputGroup className='my-2'>
          <InputGroupAddon addonType='prepend'>
            <InputGroupText>Name</InputGroupText>
          </InputGroupAddon>
          <Input
            type='text'
            value={this.state.dictionary_name}
            onChange={this.update_state}
          />
        </InputGroup>
        <InputGroup className='my-2'>
          <InputGroupAddon addonType='prepend'>
            <InputGroupText>Description</InputGroupText>
          </InputGroupAddon>        
          <Input
            type='text'
            value={this.state.description}
            onChange={this.update_state}
          />
        </InputGroup>
        <br />
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
            <tr>
              <td>New</td>
              <td>
                <Input 
                  name='new_word_spelling'
                  onChange={this.update_state}
                  value={this.state.new_word_spelling} 
                  placeholder='Type word or phrase '/>
              </td>
              <td>
                <Input 
                  name='new_word_definition'
                  onChange={this.update_state}
                  value={this.state.new_word_definition} 
                  placeholder='Defition of new word'/>
              </td>
              <td>
                <Button outline color='success'
                  onClick={this.add_new_word}>+
                </Button>
              </td>
            </tr>
            {words_list}
          </tbody>
        </Table>
      </Container>
    );
  }
}

export default withRouter(Dictionary);