import React from 'react';
import { Component } from 'react';
import { Container, Spinner,
  Card, CardHeader, CardBody, Button,
  ListGroup, ListGroupItem,
  UncontrolledCollapse, CardTitle, CardText } from 'reactstrap'

import { withRouter } from 'react-router-dom';

import NewDictionary from './NewDictionary';
import fetchData from '../../Utils/fetchData';

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
    this.getDictionary = this.getDictionary.bind(this);
    this.getDictionaries = this.getDictionaries.bind(this);
    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getDictionaries();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getDictionaries() {
    if (!this.props.isLoggedIn) {
      return;
    }
    this.setState({
      requestingData: true
    });
     
    this.fetchData('/dicts/dictionaries')
      .then((data) => {
        this.setState({
          dictionaries: data.dictionaries,
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

  getWordsList(words, dictionaryId) {

    if (words.length === 0) {
      return (
        <div>
          Nothing there! You can add
          <Button
            className='mx-1 my-1'
            outline 
            color='dark'
            onClick={() => this.openDictionary(dictionaryId)}
          >
            New word
          </Button>
        </div>
      );
    }
    const wordsList = words.map(word => 
      <Button 
        key={word.id}
        className='mx-1 my-1'
        outline 
        color='dark'
        onClick={() => this.openDictionary(dictionaryId)}
      >
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
            <CardText>Progress: {dict.progress.toFixed(2)}%</CardText>  
            <Button outline 
              id={'words_togger'.concat(dict.id)} 
              color='info'
            >
              Words
            </Button>
            <p/>
            <UncontrolledCollapse toggler={'#words_togger'.concat(dict.id)}>
              {this.getWordsList(dict.words, dict.id)}
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
    
    return (
      <Container>             
        <h3>Dictionaries</h3>
        {this.props.isLoggedIn &&
          <NewDictionary 
            onSaveDictionary={this.onSaveDictionary}
          />
        }
        {this.state.requestingData && <Spinner type='grow' color='dark' />}
        {this.getDictionaiesList()}      
      </Container>        
    );
  }
}
export default withRouter(Dictionaries);