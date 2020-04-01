import React from 'react';
import { Component } from "react";
import { Input,InputGroup, Button,
  InputGroupButtonDropdown, DropdownToggle, 
  DropdownMenu, DropdownItem } from 'reactstrap';

class Word extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: '',
      saved: true,
      definitions: [],
      getVisible: false,
      splitOpen: false
    };

    this.setGetVisible = this.setGetVisible.bind(this);
    this.getDefinitionsList = this.getDefinitionsList.bind(this);
    this.getDefinitions = this.getDefinitions.bind(this);
    this.updateState = this.updateState.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
    this.setDefinition = this.setDefinition.bind(this);
    this.hideGetButton = this.hideGetButton.bind(this);
  
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      spelling: newProps.word.spelling,
      definition: newProps.word.definition
    });
  }

  componentDidMount() {
    this.setState({
      spelling: this.props.word.spelling,
      definition: this.props.word.definition
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
      saved: false
    });
  }

  deleteWord(word_id) {
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

  hideGetButton() {
    //Set the timer and hide button in a seconds
    setTimeout(function() { 
        this.setState({getVisible: false}) 
    }.bind(this), 1000);
  }

  setGetVisible(isVisible) {
    this.setState({getVisible: isVisible});
  }

  getDefinitions() {    
    if (!this.state.spelling) {
      console.log('Spelling is empty');
      // TODO Show popover
    }
    if (!this.state.splitOpen) {
      this.getDefinitionsAPI(this.state.spelling);
      this.setState({splitOpen: true});
    } else {
      this.setState({splitOpen: false});
    }        
  }

  getDefinitionsAPI(spelling) {
    
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/get_definition', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'spelling': spelling
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }       
        if ('message' in data) {
          console.log(data);
          return; 
        }
        this.setState({definitions: data.definitions});
      },
      (error) => {
        console.log(error);
      }
    );
    
  }

  setDefinition(definition) {
    if (!definition) {
      console.log('Empty definition');
      return;
    }
    this.setState({
      definition: definition,
      getVisible: false,
      saved: false
    });
  }

  getDefinitionsList() {
    let i = 1;
    const definitions = this.state.definitions;
    
    if (!definitions || definitions.length === 0) {
      return <DropdownItem key={i++}>Couldn't get online definition</DropdownItem>
    }
    return definitions.map(definition =>
      <DropdownItem key={i++}
        onClick={() => this.setDefinition(definition.definition)}
        >{definition.definition}</DropdownItem>
    );
  }

  saveWord() {
    if (this.state.saved === true) {
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
    const i = this.props.i;
    return ( 
      <tr onFocus={() => this.setGetVisible(true)}>
        <td>{i}</td>
        <td>
          <Input 
            value={this.state.spelling}
            name='spelling' 
            onChange={this.updateState}
          />
        </td>
        <td>
          <InputGroup>
            {this.state.getVisible && (
              <InputGroupButtonDropdown                   
                addonType='prepend'
                isOpen={this.state.splitOpen}
                toggle={this.getDefinitions}>
                <DropdownToggle caret outline>
                  Get
                </DropdownToggle>
                <DropdownMenu>         
                  {this.getDefinitionsList()}         
                </DropdownMenu>
              </InputGroupButtonDropdown>                 
            )}
            <Input 
              value={this.state.definition}
              name='definition'              
              onChange={this.updateState}
              onBlur={this.hideGetButton}
            />
          </InputGroup>
        </td>
        <td>
          <Button outline 
            onClick={() => this.deleteWord(this.props.word.id)}
            color='danger'>{String.fromCharCode(0x2015)}
          </Button>
        </td>
      </tr>
    );
  }
}

export default Word;