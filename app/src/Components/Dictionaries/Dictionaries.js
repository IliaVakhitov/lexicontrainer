import React from 'react';
import { Component } from 'react';
import { Container, Input, Spinner,
  InputGroup, InputGroupAddon, InputGroupText,
  Popover, PopoverBody, Card, CardHeader, CardBody, Button,
  ListGroup, ListGroupItem, Collapse,
  UncontrolledCollapse, CardTitle, CardText } from 'reactstrap'
import { withRouter } from 'react-router-dom';

class Dictionaries extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dictionaries: [], 
      newDictionaryName:'',
      newDictionaryDescription:'',
      addDictionary: false,
      namePopover: false,
      fetchInProgress: true
    };

    this._isMounted = false; 
    this.getWordsList = this.getWordsList.bind(this);
    this.updateState = this.updateState.bind(this);
    this.saveDictionary = this.saveDictionary.bind(this);
    this.addDictionary = this.addDictionary.bind(this);
    this.openDictionary = this.openDictionary.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.getDictionaiesList = this.getDictionaiesList.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.allDictionaries();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  allDictionaries() {
    this.setState({fetchInProgress: true});
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries', {
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
          dictionaries: data.dictionaries,
          fetchInProgress: false
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          fetchInProgress: false
        });
      }
    );   
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value,
      namePopover: false
    });
  }

  saveDictionary() {
    if (!this.state.newDictionaryName) {
      this.setState({namePopover: true});
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/add_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        dictionary_name: this.state.newDictionaryName,  
        dictionary_description: this.state.newDictionaryDescription,  
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
          newDictionaryName:'',
          newDictionaryDescription:'',
          addDictionary: false
        });
        this.allDictionaries();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  cancelEdit() {
    this.setState({
      newDictionaryName:'',
      newDictionaryDescription:'',
      addDictionary: false,
      namePopover: false
    });  
  }

  addDictionary() {
    this.setState({
      addDictionary: !this.state.addDictionary
    });
  }

  openDictionary(id) {
    this.props.history.push({
      pathname:'/dictionary', 
      state: { id: id }
    });
  }

  getWordsList(words) {
    if (words.length === 0) {
      return (<div>Nothing there! You can add new word!</div>);
    }
    const wordsList = words.map(word => 
      <Button 
        key={word.id}
        className='mx-1 my-1'  
        outline 
        color='dark'>
          {word.spelling}
      </Button>     
    );
    return (
      <div>
        {wordsList}        
      </div>
      
    );
  }

  getDictionary(dict) {
    return(
      <ListGroupItem 
        key={dict.id} 
        className='w-50'>
        <Card>
          <CardHeader>
            <Button color='' outline 
              size='md' 
              className='w-100'
              onClick={() => this.openDictionary(dict.id)}>
              {dict.dictionary_name}
            </Button>
          </CardHeader>
          <CardBody>
            <CardTitle>{dict.description}</CardTitle>
            <CardText>Progress: TODO</CardText>  
            <Button outline 
              id={'words_togger'.concat(dict.id)} 
              color='info'>Words</Button>
            <p/>
            <UncontrolledCollapse toggler={'#words_togger'.concat(dict.id)}>
              {this.getWordsList(dict.words)}          
            </UncontrolledCollapse> 
          </CardBody>              
        </Card>      
              
      </ListGroupItem> 
    );
  }
  getDictionaiesList() {
    let j = 0;
    let dictionaries = this.state.dictionaries.slice();
    let dictComp = [];
    while (dictionaries.length > 0) {
      let dictList = [];
      for(var i = 0; i < 3 && dictionaries.length > 0; i++){
        dictList.push(dictionaries.shift());
      }
      const dictionariesList = dictList.map(dictionary => 
        this.getDictionary(dictionary)  
      );
      dictComp.push(
        <ListGroup key={j++} horizontal='lg'>
          {dictionariesList}          
        </ListGroup>
      );
    }     
    return (
      <div>
        {dictComp}
      </div>
       
    );
  }

  render() {
    const fetchInProgress = this.state.fetchInProgress;
    return (
      <Container>     
        {fetchInProgress && <Spinner type='grow' color='dark' />}
        <h3>Dictionaries</h3>
        <p>
          <Button outline 
            color='primary' 
            onClick={this.addDictionary}>
              Add new
          </Button>
        </p>
        <Collapse isOpen={this.state.addDictionary}>
          <Card className='w-100'>
            <CardBody>
              <InputGroup className='my-2'>
                <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                  <InputGroupText className='w-100'>Name</InputGroupText>
                </InputGroupAddon>                
                <Input 
                  type='text' 
                  value={this.state.newDictionaryName} 
                  name='newDictionaryName'
                  id='newDictionaryName'
                  placeholder='Type name for new dictionary'
                  onChange={this.updateState}
                />
                <Popover
                  placement='top'
                  isOpen={this.state.namePopover}
                  target='newDictionaryName'>
                  <PopoverBody>
                    Please, fill out this field!
                  </PopoverBody>
                </Popover>
              </InputGroup>          
              <InputGroup className='my-2'>
                <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
                  <InputGroupText className='w-100'>Description</InputGroupText>
                </InputGroupAddon>
                <Input 
                  type='text'
                  name='newDictionaryDescription' 
                  value={this.state.newDictionaryDescription} 
                  placeholder='Type description for new dictionary'
                  onChange={this.updateState}
                />
              </InputGroup>
              <Button outline 
                color='success' 
                className='mx-1 my-1'
                onClick={this.saveDictionary}>
                Save
              </Button>
              <Button outline 
                color='secondary' 
                className='mx-1 my-1'
                onClick={this.cancelEdit}>
                Cancel
              </Button>
            </CardBody>
          </Card>
        </Collapse>
        {this.getDictionaiesList()}      
      </Container>        
    );
  }
}
export default withRouter(Dictionaries);