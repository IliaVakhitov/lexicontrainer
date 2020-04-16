import React from 'react';
import { Component } from 'react';
import { Container, Spinner,
  Card, CardHeader, CardBody, Button,
  ListGroup, ListGroupItem,
  UncontrolledCollapse, CardTitle, CardText } from 'reactstrap'

  import { withRouter } from 'react-router-dom';

import NewDictionary from './NewDictionary';

class Dictionaries extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dictionaries: [], 
      requestingData: true
    };

    this._isMounted = false;

    this.getWordsList = this.getWordsList.bind(this);
    this.openDictionary = this.openDictionary.bind(this);
    this.onSaveDictionary = this.onSaveDictionary.bind(this);
    this.getDictionaiesList = this.getDictionaiesList.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getDictionaries();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getDictionaries() {
    this.setState({requestingData: true});
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries_list', {
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
          requestingData: false
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          requestingData: false
        });
      }
    );   
  }

  onSaveDictionary() {
    this.getDictionaries(); 
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
        style={{borderStyle: 'none'}}
        key={dict.id} 
        className='w-50'>
        <Card>
          <CardHeader
            tag='a' 
            style={{ cursor: 'pointer' }} 
            onClick={() => this.openDictionary(dict.id)}
          >          
            {dict.dictionary_name}            
          </CardHeader>
          <CardBody>
            <CardTitle>{dict.description}</CardTitle>
            <CardText>Progress: TODO</CardText>  
            <Button outline 
              id={'words_togger'.concat(dict.id)} 
              color='info'
            >
              Words
            </Button>
            <p/>
            <UncontrolledCollapse toggler={'#words_togger'.concat(dict.id)}>
              this.getWordsList(dict.words)
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
        <ListGroup           
          key={j++} 
          horizontal='lg'
        >
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
    const requestingData = this.state.requestingData;
    return (
      <Container>             
        <h3>Dictionaries</h3>
        <NewDictionary 
          onSaveDictionary={this.onSaveDictionary}
        />
        {requestingData && <Spinner type='grow' color='dark' />}
        {this.getDictionaiesList()}      
      </Container>        
    );
  }
}
export default withRouter(Dictionaries);