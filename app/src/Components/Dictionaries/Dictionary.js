import React from 'react';
import { Component } from 'react';
import { Container, Input } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Button,
  InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Card, CardBody,Table } from 'reactstrap';

import { withRouter } from 'react-router-dom';

class Dictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.location.state.id,
      name: '',
      description: '',
      words: [],
      updatedWords: [],
      getButtonVisible: [],
      splitButtonOpen: [],
      definitions: [],
      newWordSpelling: '',
      newWordDefinition: '',
      newWordGetButtonVisible: false,
      newWordSplitButtonOpen: false
    };

    this.saveDictionary = this.saveDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.addNewWord = this.addNewWord.bind(this);
    this.updateWord = this.updateWord.bind(this);
    this.saveWord = this.saveWord.bind(this);
    this.changeGetButtonVisible = this.changeGetButtonVisible.bind(this);
    this.isGetButtonVisible = this.isGetButtonVisible.bind(this);
    this.getDefinitions = this.getDefinitions.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeNWSplitBtnOpen = this.changeNWSplitBtnOpen.bind(this);
    this.changeNWGetBtnVisible = this.changeNWGetBtnVisible.bind(this);
    this.getNewWordDefition = this.getNewWordDefition.bind(this);
    this.getWordsList = this.getWordsList.bind(this);
  }
  
  componentDidMount() {
    this.dictionary();
    this.myInterval = setInterval(() => {
      this.saveWords();
    }, 3000);

  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  updateState(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  changeNWGetBtnVisible() {
    this.setState({newWordGetButtonVisible: !this.state.newWordGetButtonVisible});
  }

  changeNWSplitBtnOpen() {
    this.setState({newWordSplitButtonOpen: !this.state.newWordSplitButtonOpen});
  }

  dictionary() {
  
    if (isNaN(this.state.id)) {
      console.log('Incorrect dictionary id '.concat(this.state.id));
      this.props.history.push('/dictionaries');
    }
    
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    myHeaders.append('dictionary_id', this.state.id);  
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
        let getButtonVisible = [];
        let splitButtonOpen = [];
        let definitions = [];
        // First element for new word
        for (var i=0; i<data.words.length; i++) {
          getButtonVisible.push(false);
          splitButtonOpen.push(false);
          definitions.push([]);
        }
        this.setState({
          name: data.dictionary_name,
          description: data.description,
          words: data.words,
          getButtonVisible: getButtonVisible,
          splitButtonOpen: splitButtonOpen,
          definitions: definitions
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

  addNewWord() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/add_word', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.id,  
        'spelling': this.state.newWordSpelling,  
        'definition': this.state.newWordDefinition
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
        this.setState({
          newWordSpelling: '',
          newWordDefinition: '',
        });
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  updateWord(index, event) {
    
    let words = this.state.words;
    if (index >= words.length || index < 0) {
      console.log('Incorrect index' + index + '. Arraly len = ' + words.length);
      return;
    }
    let updatedWords = this.state.updatedWords;
    updatedWords.push(index);
    words[index][event.target.name] = event.target.value;
    this.setState({
      words: words,
      updatedWords: updatedWords
    });
  }

  saveWords() {
    let updatedWords = this.state.updatedWords;
    while (updatedWords.length>0) {
      this.saveWord(updatedWords.pop());
    }
  }

  saveWord(index) {
    const words = this.state.words;
    if (index >= words.length || index < 0) {
      console.log('Incorrect index ' + index);
      return;
    }
    const word = words[index];
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

  saveDictionary() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/update_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'dictionary_id': this.state.id,  
        'dictionary_name': this.state.name,  
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

  cancelEdit() {
      this.props.history.push('/dictionaries');
  }

  changeGetButtonVisible(index) {
    
    let getButtonVisible = this.state.getButtonVisible;
    if (index >= getButtonVisible.length || index < 0) {
      console.log('Incorrect index ' + index);
      return;
    }
    getButtonVisible.fill(false)
    getButtonVisible[index] = true;
    this.setState({getButtonVisible: getButtonVisible});
  }

  isGetButtonVisible(index) {
    const getButtonVisible = this.state.getButtonVisible;
    if (index >= getButtonVisible.length || index < 0) {
      console.log('Incorrect index ' + index);
      return false;
    }
    return getButtonVisible[index];
  }

  isSplitButtonOpen(index) {
    const splitButtonOpen = this.state.splitButtonOpen;
    if (index >= splitButtonOpen.length || index < 0) {
      console.log('Incorrect index ' + index);
      return false;
    }
    return splitButtonOpen[index];
  }

  getNewWordDefition() {
    this.setState({newWordSplitButtonOpen: !this.state.newWordSplitButtonOpen});
  }

  getDefinitions(index) {
    const words = this.state.words;
    if (index >= words.length || index < 0) {
      console.log('Incorrect index ' + index);
      return;
    }
    const word = this.state.words[index];
    let splitButtonOpen = this.state.splitButtonOpen;
    this.getDefinitionsAPI(word.spelling, index);
    splitButtonOpen[index] = !splitButtonOpen[index];
    this.setState({splitButtonOpen: splitButtonOpen});
         
  }

  getDefinitionsAPI(spelling, index) {
    
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
        let stateDefinitions = this.state.definitions;
        stateDefinitions[index] = data.definitions;
        this.setState({definitions: stateDefinitions});
      },
      (error) => {
        console.log(error);
      }
    );
    
  }

  setDefinition(index, definition) {
    if (!definition) {
      console.log('Empty definition');
      return;
    }

    let words = this.state.words;
    let getButtonVisible = this.state.getButtonVisible;
    
    if (index >= words.length  
        || index >= getButtonVisible.length
        || index < 0) {
      console.log('Incorrect index ' + index);
      return;
    } 
    
    words[index].definition = definition;
    getButtonVisible[index] = false;
    this.setState({
      words: words,
      getButtonVisible: getButtonVisible
    });
  }

  getDefinitionsList(index) {
    let i = 1;
    const definitions = this.state.definitions;
    if (index >= definitions.length || index < 0) {
      console.log('Incorrect index ' + index);
      return;
    }
    if (!definitions[index] || definitions[index].length === 0) {
      return <DropdownItem key={i++}>Couldn't get online definition</DropdownItem>
    }
    return definitions[index].map(definition =>
      <DropdownItem key={i++}
        onClick={() => this.setDefinition(index, definition.definition)}
        >{definition.definition}</DropdownItem>
    );
  }

  getWordsList() {
    let i = 1;
    const words = this.state.words;
    return words.map(word =>
      <tr key={word.id}>
        <td>{i++}</td>
        <td>
          <Input 
            value={word.spelling}
            name='spelling' 
            onChange={(event) => this.updateWord(
              this.state.words.indexOf(word), event
            )}
          />
        </td>
        <td>
          <InputGroup>
            {this.isGetButtonVisible(this.state.words.indexOf(word)) && (
              <InputGroupButtonDropdown                   
                addonType='prepend'
                isOpen={this.isSplitButtonOpen(
                  this.state.words.indexOf(word)
                )} 
                toggle={() => this.getDefinitions(
                  this.state.words.indexOf(word)
                )}>
                <DropdownToggle caret outline>
                  Get
                </DropdownToggle>
                <DropdownMenu>         
                  {this.getDefinitionsList(this.state.words.indexOf(word))}         
                </DropdownMenu>
              </InputGroupButtonDropdown>                 
            )}
            <Input 
              value={word.definition}
              name='definition'
              onFocus={() => this.changeGetButtonVisible(
                this.state.words.indexOf(word)
              )}
              onChange={(event) => this.updateWord(
                this.state.words.indexOf(word), event
              )}
            />
          </InputGroup>
        </td>
        <td>
          <Button outline 
            onClick={() => this.delete_word(word.id)}
            color='danger'>{String.fromCharCode(0x2015)}
          </Button>
        </td>
      </tr>
      );
  }

  render() {
    
    return (
      <Container>
        <div>
          <Button outline 
            color='success' 
            onClick={this.saveDictionary}
            className='mx-1 my-1'>Save</Button>
          <Button outline 
            color='secondary' 
            onClick={this.cancelEdit}
            className='mx-1 my-1'>Cancel</Button>
        </div>
        <InputGroup className='my-2'>
          <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
            <InputGroupText className='w-100'>Name</InputGroupText>
          </InputGroupAddon>
          <Input
            type='text'
            name='name'
            value={this.state.name}
            onChange={this.updateState}
          />
        </InputGroup>
        <InputGroup className='my-2'>
          <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
            <InputGroupText className='w-100'>Description</InputGroupText>
          </InputGroupAddon>        
          <Input
            type='text'
            name='description'
            value={this.state.description}
            onChange={this.updateState}
          />
        </InputGroup>
        <br />
        <Card>
          <CardBody>
            <h5>New word</h5>
            <InputGroup className='my-2'>
              <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                <InputGroupText className='w-100'>Spelling</InputGroupText>
              </InputGroupAddon>        
                <Input 
                  value={this.state.newWordSpelling}
                  name='newWordSpelling'
                  onChange={this.updateState} 
                  placeholder='Type word or phrase '
                />
            </InputGroup>            
            <InputGroup className='my-2'>
              <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                <InputGroupText className='w-100'>Definition</InputGroupText>
              </InputGroupAddon>        
              {this.state.newWordGetButtonVisible &&  
                <InputGroupButtonDropdown                   
                  addonType='prepend'
                  isOpen={this.state.newWordSplitButtonOpen} 
                  toggle={this.getNewWordDefition}>
                  <DropdownToggle caret outline>
                    Get
                  </DropdownToggle>
                  <DropdownMenu>         
                    <DropdownItem>Some definition</DropdownItem>         
                  </DropdownMenu>
                </InputGroupButtonDropdown>
              }
              <Input 
                name='newWordDefinition'
                onChange={this.updateState} 
                onFocus={this.changeNWGetBtnVisible}
                value={this.state.newWordDefinition}
                placeholder='Defition of new word'
              />
            </InputGroup>     
            <Button outline color='success'
              onClick={this.addNewWord}
            >Add
            </Button>        
          </CardBody>       
        </Card>
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

export default withRouter(Dictionary);