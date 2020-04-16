import React from 'react';
import { Component } from 'react';
import { Input, Button, 
  InputGroup, InputGroupAddon, InputGroupText,
  Card, CardBody, CardHeader, FormFeedback,
  Collapse} from 'reactstrap'; 

import Symonyms from './Symonyms';
import Definition from './Definition';
import WordDictionary from './WordDictionary';
  
class Word extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionaryId: null,
      spelling: '',
      definition: '',
      progress: 0,
      synonyms: '',
      saved: true,
      collapseOpen: false,
      updateDictionary: false
    };

    this.updateState = this.updateState.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
    this.showCollapse = this.showCollapse.bind(this); 
    this.updateDefinition = this.updateDefinition.bind(this); 
    this.updateSynonyms = this.updateSynonyms.bind(this); 
    this.updateDictionary = this.updateDictionary.bind(this); 
  }

  componentDidMount() {
    this.setState({
      dictionaryId: this.props.word.dictionary_id,
      spelling: this.props.word.spelling,
      definition: this.props.word.definition,
      progress: this.props.word.progress
    });
    
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
    if (!this.state.saved) {
      this.saveWord();
    }
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      saved: false,
    });
  }

  updateDefinition(definition) {
    this.setState({ 
      definition: definition,
      saved: false
    });     
  }

  updateSynonyms(synonyms) {
    this.setState({ 
      synonyms: synonyms,
      saved: false
    });     
  }

  updateDictionary(id) {
    this.setState({ 
      dictionaryId: id,
      updateDictionary: true,
      saved: false
    });
  }

  showCollapse() {    
    if (!this.state.collapseOpen) {
      this.myInterval = setInterval(() => {
        this.saveWord();
      }, 1000);
    } else {
      this.saveWord();
      clearInterval(this.myInterval);
    }
    this.setState({
      collapseOpen: !this.state.collapseOpen,
    });
  }

  deleteWord(word_id) {
    // TODO
    // Show confirmation
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
        this.props.updateList();         
      },
      (error) => {
        console.log(error);
      }
    );       
  }

  saveWord() {

    if (this.state.saved === true) {
      return;
    }
    if (!this.state.spelling) {
      return;
    }
    if (!this.state.definition) {
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/update_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.dictionaryId,
        'word_id': this.props.word.id,  
        'spelling': this.state.spelling,  
        'definition': this.state.definition  
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
          saved: true,
          progress: 0
        });  
        if (this.state.updateDictionary) {
          this.props.updateList();
        } 
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  render() {    

    return ( 
      <Card>
        <CardHeader tag='a' 
          style={{ cursor: 'pointer' }} 
          onClick={this.showCollapse}
        >
          <h5>{this.state.spelling}</h5>                  
        </CardHeader>
        <Collapse isOpen={this.state.collapseOpen}>
          <CardBody>   
            <InputGroup >
              <InputGroupAddon  style={{width:'11%'}} addonType='prepend'>
                <InputGroupText className='w-100'>Spelling</InputGroupText>
              </InputGroupAddon>         
              <Input 
                invalid={!this.state.spelling}
                value={this.state.spelling}
                name='spelling' 
                id='spelling' 
                onChange={this.updateState}/>
              <FormFeedback>Please, fill out this field!</FormFeedback>
            </InputGroup>            
            <Definition 
              updateDefinition={(value) => this.updateDefinition(value)}
              key={'definition'.concat(this.props.word.id)} 
              id={this.props.word.id}
              spelling={this.props.word.spelling}
              definition={this.props.word.definition} 
              definitions={this.props.word.definitions} 
            />  
            <span               
              hidden={this.state.definition}
              style={{color:'#e63b45', fontSize:'13px'}}
            >
              Please, fill out this field!
            </span>        
            <Symonyms 
              updateSynonyms={(value) => this.updateSynonyms(value)}
              key={'synonyms'.concat(this.props.word.id)} 
              id={this.props.word.id}
              spelling={this.props.word.spelling}
              synonyms={this.props.word.synonyms} 
            />  
            <WordDictionary 
              dictionaries={this.props.dictionaries}
              updateDictionary={value => this.updateDictionary(value)}
              id={this.props.word.id} 
              dictionaryName={this.props.word.dictionary_name}
              dictionaryId={this.state.dictionaryId}
            />           
            Progress: {this.state.progress}%          
            <Button 
              className='float-right'
              outline 
              onClick={() => this.deleteWord(this.props.word.id)}
              color='danger'
            >
              Delete word
            </Button>            
          </CardBody>
        </Collapse>
      </Card>
    );
  }
}

export default Word;
