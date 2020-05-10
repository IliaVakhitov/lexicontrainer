import React from 'react';
import { Component } from 'react';
import { Input, Label, Col, FormFeedback,
  FormGroup, Form, ButtonGroup, Button, Container } from 'reactstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { withRouter } from 'react-router-dom';

import fetchData from '../../Utils/fetchData';

const animatedComponents = makeAnimated();

class Games extends Component {
  constructor(props){
    super(props);

    this.state = {
      currentGame: false,
      currentGameType: '',
      gameType: 'FindDefinition',
      gameRounds: 10,
      includeLearned: true,
      dictionaries: [],
      options: [],
      selectedDictionaries: []      
    };

    this._isMounted = false; 

    this.setGameType = this.setGameType.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeIncludeLearned = this.changeIncludeLearned.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeGame = this.removeGame.bind(this);
    this.resumeGame = this.resumeGame.bind(this);
    this.checkOptions = this.checkOptions.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.fetchData = fetchData.bind(this);

  }

  componentDidMount() {
    this._isMounted = true; 
    this._isMounted && this.checkCurrentGame(); 
    this._isMounted && this.dictionaries(); 
  }

  createOption(key, value) {    
    return ({ 
      key: key,     
      label: value,
      value: value,
    });    
  }

  updateOptions() {
    let options = [];
    this.state.dictionaries.forEach(element => {
      let newOption = this.createOption(element.id, element.dictionary_name);
      options.push(newOption);
    });
    this.setState({ 
      options: options
    });
  }

  handleSelectChange(newValue) {
    this.setState({
      selectedDictionaries: newValue
    });
  }

  checkOptions() {
    if (this.state.dictionaries.length !== this.state.options.length) {
      this.updateOptions();
    }
  }

  resumeGame() {
    this.props.history.push('/play');
  }

  removeGame() {
    this.fetchData('/games/remove_game', 'DELETE')
      .then((data) => {
        if('result' in data) {
          this.setState({ currentGame: false });
        }
      }
    );   
  }

  checkCurrentGame() {
    this.fetchData('/games/check_current_game')
      .then((data) => {
        if( 'current_game' in data) {
          this.setState({
            currentGame: data.current_game,
            currentGameType: data.game_type,
            progress: data.progress
          }); 
        }
      }
    ); 
  }

  setGameType(newGameType) {
    this.setState({gameType: newGameType});
  }

  updateState(event) {
    this.setState({ [event.target.name]: event.target.value });
    if (this.state.gameRounds < 4) {
      this.setState({ gameRounds: 4 }); 
    }
  }

  changeIncludeLearned() {
    this.setState({includeLearned: !this.state.includeLearned});
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.gameRounds < 4) {
      return;
    }
    const body = JSON.stringify({
      'game_type':this.state.gameType,
      'game_rounds':this.state.gameRounds,
      'include_learned_words':this.state.includeLearned,
      'dictionaries':this.state.selectedDictionaries,
    });
    this.fetchData('/games/define_game', 'POST', [], body)
      .then(() => {
        this.props.history.push('/play');
      }
    );         
  }

  dictionaries() {
    this.fetchData('/dicts/dictionaries_list')
      .then((data) => {        
        this.setState({
          dictionaries: data.dictionaries,
          isLoggedIn: data.is_authenticated
        });
        this.updateOptions();
      }
    );   
  }

  render() {
    const options = this.state.options;
    let currentGameInfo;
    if (this.state.currentGame) {
      currentGameInfo = 
        <div>
          <p>
            Found incompleted game. 
            Game type: {this.state.currentGameType}. 
            Progress: {this.state.progress}%.</p>
          <p>
            Would you like to continue?
          </p>
          <p> 
            <Button 
              outline 
              className='mx-1 my-1'
              color='secondary' 
              onClick={this.resumeGame}
            >
              Continue
            </Button>
            <Button 
              outline 
              className='mx-1 my-1'
              color='danger'
              onClick={this.removeGame}
            >
              Remove
            </Button>
          </p>
        </div>
    };

    return (
      <Container>
        <h3>Define game</h3>
          {currentGameInfo}
        <br />
        <Form onSubmit={this.handleSubmit}>
          <FormGroup row>
            <Label for='gameType' sm={2}>Game type</Label>
            <Col sm={5}>
              <ButtonGroup name='gameType' id='gameType'>
                <Button 
                  color='secondary' 
                  onClick={() => this.setGameType('FindDefinition')} 
                  active={this.state.gameType === 'FindDefinition'}
                >
                  Find definition
                </Button>
                <Button 
                  color='secondary' 
                  onClick={() => this.setGameType('FindSpelling')} 
                  active={this.state.gameType === 'FindSpelling'}
                >
                  Find spelling
                </Button>
                <Button 
                  color='secondary' 
                  onClick={() => this.setGameType('FindSynonyms')} 
                  active={this.state.gameType === 'FindSynonyms'}
                >
                  Find synonyms
                </Button>
              </ButtonGroup>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='gameRounds' sm={2}>Game rounds</Label>
            <Col sm={2}>
              <Input 
                invalid={this.state.gameRounds < 4}
                type='number' 
                min='4'
                name='gameRounds'
                id='gameRounds'
                value={this.state.gameRounds} 
                onChange={this.updateState} 
              />
              <FormFeedback>Please, select more than 4!</FormFeedback> 
            </Col>
          </FormGroup> 
          <FormGroup row>
            <Label for='dictionaries' sm={2}>Dictionaries</Label>
            <Col sm={7}>
              <Select
                components={animatedComponents}
                name='dictionaries' 
                id='dictionaries' 
                isClearable 
                isMulti 
                isLoading={this.state.requestingData}
                onMenuOpen={this.checkOptions}
                onChange={this.handleSelectChange} 
                closeMenuOnSelect={false}                
                options={options} 
                placeholder='All'
              />
            </Col>
          </FormGroup> 
          {this.state.isLoggedIn && 
            <FormGroup check>
              <Input 
                type='checkbox' 
                id='includeLearned'
                value={this.state.includeLearned} 
                onClick={this.changeIncludeLearned} 
              />
              {' '} 
              <Label for='includeLearned'>Include learned words</Label>
            </FormGroup>    
          }        
          <FormGroup row>
            <Col>
              <Button 
                color='success'
                disabled={this.state.gameRounds < 4}
              >
                Start
              </Button>
            </Col>
          </FormGroup>      
        </Form>
      </Container>
    );
  }
}

export default withRouter(Games);