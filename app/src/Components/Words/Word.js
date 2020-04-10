import React from 'react';
import { Component } from 'react';
import { Input, Button, 
  InputGroup, InputGroupAddon, InputGroupText,
  Card, CardBody, CardHeader,
  Popover, PopoverBody, Collapse} from 'reactstrap'; 

import Symonyms from './Symonyms';
import Definition from './Definition';
  
class Word extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      saved: true,
      collapseOpen: false,
      spellingPopover: false
    };

    this.updateState = this.updateState.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
    this.showCollapse = this.showCollapse.bind(this); 
  }

  componentDidMount() {
    this.setState({
      spelling: this.props.word.spelling
    });
    this.myInterval = setInterval(() => {
      this.saveWord();
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      saved: false,
      spellingPopover: false
    });
  }

  showCollapse() {
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
        this.props.onDeleteWord();         
      },
      (error) => {
        console.log(error);
      }
    );       
  }

  saveWord() {
    //TODO

    if (this.state.saved === true) {
      return;
    }
    if (!this.state.spelling) {
      this.setState({spellingPopover: true});
      return;
    }
    if (!this.state.definition) {
      this.setState({definitionPopover: true});
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/update_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
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
        this.setState({saved: true});   
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
              <Popover
                placement='top'
                isOpen={this.state.spellingPopover}
                target='spelling'>
                <PopoverBody>
                  Please, fill out this field!
                </PopoverBody>
              </Popover>       
              <Input 
                value={this.state.spelling}
                name='spelling' 
                id='spelling' 
                onChange={this.updateState}/>
            </InputGroup>            
            <Definition 
              key={'definition'.concat(this.props.word.id)} 
              word={this.props.word} />          
            <Symonyms 
              key={'synonyms'.concat(this.props.word.id)} 
              word={this.props.word} />             
            Progress: {this.props.word.progress}%          
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
