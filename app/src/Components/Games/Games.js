import React from 'react';
import { Component } from 'react';
import { Input, Label, Col, FormFeedback,
  FormGroup, Form, ButtonGroup, Button, Container } from 'reactstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { withRouter } from 'react-router-dom';

const animatedComponents = makeAnimated();

class Games extends Component {
  constructor(props){
    super(props);

    this.state = {
      currentGame: false,
      currentGameType: '',
      gameType: 'FindDefinition',
      gameRounds: 10,
      includeLearned: false,
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
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/remove_game', {
      method: 'DELETE',
      credentials: 'include',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if( 'result' in data) {
          this.setState({ currentGame: false });
        } else {
          console.log(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  checkCurrentGame() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/check_current_game', {
      method: 'GET',
      credentials: 'include',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if ('error' in data) {
          console.log(data);
          return;
        } 
        if( 'currentGame' in data) {
          this.setState({
            currentGame: data.current_game,
            currentGameType: data.game_type,
            progress: data.progress
          }); 
        }
      },
      (error) => {
        console.log(error);
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
    // TODO validate form data
    if (this.state.gameRounds < 4) {
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/define_game', {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({
        'game_type':this.state.gameType,
        'game_rounds':this.state.gameRounds,
        'include_learned_words':this.state.includeLearned,
        'dictionaries':this.state.selectedDictionaries,
      })
    })
      .then(res => res.json())
      .then((data) => {
        this.props.history.push('/play');
      },
      (error) => {
        console.log(error);
      }
    );         
  }

  dictionaries() {

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/game_dictionaries', {
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
        });
        this.updateOptions();
      },
      (error) => {
        console.log(error);
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
            Game type {this.state.currentGameType}. 
            Progress {this.state.progress}%.</p>
          <p>
            Would you like to continue?
          </p>
          <p> 
            <Button 
              outline 
              color='secondary' 
              onClick={this.resumeGame}
            >
              Continue
            </Button>{' '}
            <Button 
              outline 
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