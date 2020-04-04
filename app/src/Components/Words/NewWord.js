import React from 'react';
import { Component } from 'react';
import { Input,InputGroup, InputGroupAddon, InputGroupText, Button,
  InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Card, CardBody, Popover, PopoverBody, Spinner } from 'reactstrap';


class NewWord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spelling: '',
      definition: '',
      definitions: [],
      getVisible: false,
      splitOpen: false,
      spellingPopover: false,
      definitionPopover:false,
      requestingDefitions: false,
      requestError: false
    };

    this.addNewWord = this.addNewWord.bind(this);
    this.updateState = this.updateState.bind(this);
    this.cardChangeFocus = this.cardChangeFocus.bind(this);
    this.getDefinitions = this.getDefinitions.bind(this);
    this.stayFocused = this.stayFocused.bind(this);    
    this.getDefinitionsList = this.getDefinitionsList.bind(this);    
    this.setDefinition = this.setDefinition.bind(this);
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      spellingPopover: false,
      definitionPopover:false,
      requestError: false,
      definitions: []
    });
  }

  stayFocused() {
    this.setState({
      requestingDefitions: true   
    });
  }

  cardChangeFocus(isVisible) {
    if (this.state.requestingDefitions) {
      return;
    }
    this.setState({
      getVisible: isVisible && this.state.spelling
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

  addNewWord() {
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
    fetch('/words/add_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.props.dictionaryId,  
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
          spelling: '',
          definition: '',
        });
        this.props.addNewWord();
      },
      (error) => {
        console.log(error);
      }
    ); 
    
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

  render() {
    return (
      <Card 
        onFocus={() => this.cardChangeFocus(true)}
        onBlur={() => this.cardChangeFocus(false)}
        >
        <CardBody>
          <Button outline color='primary'
            onClick={this.addNewWord}>
            Add new word
          </Button> 
          
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Spelling</InputGroupText>
            </InputGroupAddon>        
              <Input 
                value={this.state.spelling}
                name='spelling'
                id='spelling'
                onChange={this.updateState} 
                placeholder='Type word or phrase '
              />
              <Popover
                placement='top'
                isOpen={this.state.spellingPopover}
                target='spelling'>
                <PopoverBody>
                  Please, fill out this field!
                </PopoverBody>
              </Popover>
          </InputGroup>            
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Definition</InputGroupText>
            </InputGroupAddon>        
            {this.state.getVisible &&  
              <InputGroupButtonDropdown                   
                addonType='prepend'
                isOpen={this.state.splitOpen} 
                onMouseDown={this.stayFocused}
                toggle={this.getDefinitions}>
                <DropdownToggle caret outline>
                  Get
                </DropdownToggle>
                <DropdownMenu>         
                {this.getDefinitionsList()} 
                </DropdownMenu>
              </InputGroupButtonDropdown>
            }
            <Input 
              name='definition'
              id='definition'
              onChange={this.updateState}                 
              value={this.state.definition}
              placeholder='Defition of new word'
            />
            <Popover
              placement='bottom-start'
              isOpen={this.state.definitionPopover}
              target='definition'>
              <PopoverBody>
                Please, fill out this field!
              </PopoverBody>
            </Popover>  
          </InputGroup>   
                 
        </CardBody>       
      </Card>
    );
  }
}

export default NewWord;