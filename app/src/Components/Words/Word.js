import React from 'react';
import { Component } from "react";
import { Input, Button, Spinner,
  InputGroupButtonDropdown, DropdownToggle, 
  InputGroup, InputGroupAddon, InputGroupText,
  DropdownMenu, DropdownItem, Card, CardBody,
  Popover, PopoverBody, Collapse } from 'reactstrap';

class Word extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: '',
      saved: true,
      definitions: [],
      getVisible: false,
      splitOpen: false,
      spellingPopover: false,
      definitionPopover:false,
      collapseOpen: false,
      requestingDefitions: false,
      requestError: false
    };

    this.getDefinitionsList = this.getDefinitionsList.bind(this);
    this.getDefinitions = this.getDefinitions.bind(this);
    this.updateState = this.updateState.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
    this.setDefinition = this.setDefinition.bind(this);
    this.cardChangeFocus = this.cardChangeFocus.bind(this);
    this.stayFocused = this.stayFocused.bind(this);
  
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
      saved: false,
      spellingPopover: false,
      definitionPopover:false,
      requestError: false
    });
  }

  cardChangeFocus(show) {
    this.setState({
      collapseOpen: show || this.state.requestingDefitions,
      getVisible: show || this.state.requestingDefitions,
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

  stayFocused() {
    this.setState({
      requestingDefitions: true   
    });
    
  }

  getDefinitions() {    
    if (!this.state.spelling) {
      console.log('Spelling is empty');
    }
    if (!this.state.splitOpen) {      
      this.setState({
        splitOpen: true,
        getVisible: true
      });
      this.getDefinitionsAPI(this.state.spelling);
      this.setState({
        requestingDefitions: false
      });
    } else {
      this.setState({
        splitOpen: false,
        requestingDefitions: false
      });
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
          this.setState({
            requestError: true
          }); 
          return;
        }       
        if ('message' in data) {
          console.log(data);
          this.setState({
            requestError: true
          }); 
          return; 
        }
        this.setState({
          definitions: data.definitions
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          requestError: true
        }); 
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
      saved: false,
      requestingDefitions: false
    });
  }

  getDefinitionsList() {
    let i = 1;
    if (this.state.requestError) {
      return (
        <DropdownItem key={i++}>
          <p>Couldn't get definition</p>          
        </DropdownItem>
      );
    } 
    const definitions = this.state.definitions;
    if (!definitions || definitions.length === 0) {
      return (
        <DropdownItem key={i++}>
          <Spinner type='grow' color='dark' />
        </DropdownItem>          
      );
    }
    
    return definitions.map(definition =>
      <DropdownItem key={i++}
        onClick={() => this.setDefinition(definition.definition)}>
        {definition.definition}
      </DropdownItem>
    );
  }

  saveWord() {
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
      <Card 
        onFocus={() => this.cardChangeFocus(true)}        
        onBlur={() => this.cardChangeFocus(false)}>
        <CardBody>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>          
            <Input 
              value={this.state.spelling}
              name='spelling' 
              id='spelling' 
              onChange={this.updateState}/>
          </InputGroup>
          <Popover
            placement='top'
            isOpen={this.state.spellingPopover}
            target='spelling'>
            <PopoverBody>
              Please, fill out this field!
            </PopoverBody>
          </Popover>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Definition</InputGroupText>
            </InputGroupAddon>            
            {this.state.getVisible && (
              <InputGroupButtonDropdown                   
                addonType='prepend'
                onMouseDown={this.stayFocused}
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
              id='definition'              
              onChange={this.updateState}
              
            />
            <Popover
              placement='bottom'
              isOpen={this.state.definitionPopover}
              target='definition'>
              <PopoverBody>
                Please, fill out this field!
              </PopoverBody>
            </Popover> 
          </InputGroup>
          <Collapse isOpen={this.state.collapseOpen}> 
            <Button 
              className='float-right'
              outline 
              onClick={() => this.deleteWord(this.props.word.id)}
              color='danger'>
                Delete
            </Button>
          </Collapse>
        </CardBody>
      </Card>
    );
  }
}

export default Word;