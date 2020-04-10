import React from 'react';
import { Component } from 'react';
import { Input, Label, Col, 
  FormGroup, Form, ButtonGroup, Button, Container } from 'reactstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { withRouter } from 'react-router-dom';

const animatedComponents = makeAnimated();

class Games extends Component {
  constructor(props){
    super(props);

    this.check_current_game(); 

    this.state = {
      current_game: false,
      current_game_type: '',
      game_type: 'FindDefinition',
      game_rounds: 10,
      include_learned_words: false,
      dictionaries: [
        {'value':'1','label':'One'},
        {'value':'2','label':'Two'},
        {'value':'3','label':'Three'},
        {'value':'4','label':'Four'}
      ]
    };

    this.setGameType = this.setGameType.bind(this);
    this.update_state = this.update_state.bind(this);
    this.handleOnClickIncludeLearned = this.handleOnClickIncludeLearned.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.remove_game = this.remove_game.bind(this);
    this.resume_game = this.resume_game.bind(this);

  }

  resume_game() {
    this.props.history.push('/play');
  }

  remove_game() {
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
          this.setState({current_game: false});
        } else {
          console.log(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );   
  }

  check_current_game() {
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
        if( 'current_game' in data) {
          this.setState({current_game: data.current_game});
          if (data.current_game) {
            this.setState({
              current_game_type: data.game_type,
              progress: data.progress
            }); 
          }
        }
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  setGameType(new_game_type) {
    this.setState({game_type: new_game_type});
  }

  update_state(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleOnClickIncludeLearned() {
    this.setState({include_learned_words: !this.state.include_learned_words});
  }

  handleSubmit(event) {
    event.preventDefault();
    // TODO validate form data
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/define_game', {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({
        'game_type':this.state.game_type,
        'game_rounds':this.state.game_rounds,
        'include_learned_words':this.state.include_learned_words,
        'dictionaries':this.state.dictionaries,
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

  render() {
    const dictionaries = this.state.dictionaries;
    const current_game = this.state.current_game;
    let current_game_warning;
    if (current_game) {
      current_game_warning = 
        <div>
          <p>Found incompleted game. 
          Game type {this.state.current_game_type}. 
          Progress {this.state.progress}%.</p>
          <p>Would you like to continue?</p>
          <p> 
            <Button outline color='secondary' onClick={this.resume_game}>Continue</Button>{' '}
            <Button outline color='danger'onClick={this.remove_game}>Remove</Button></p>
        </div>
    };

    return (
      <Container>
        <h3>Define game</h3>
          {current_game_warning}
        <br />
        <Form onSubmit={this.handleSubmit}>
          <FormGroup row>
            <Label for='game_type' sm={2}>Game type</Label>
            <Col sm={5}>
              <ButtonGroup name='game_type' id='game_type'>
                <Button 
                  color='secondary' 
                  onClick={() => this.setGameType('FindDefinition')} 
                  active={this.state.game_type === 'FindDefinition'}>Find definition</Button>
                <Button 
                  color='secondary' 
                  onClick={() => this.setGameType('FindSpelling')} 
                  active={this.state.game_type === 'FindSpelling'}>Find spelling</Button>
              </ButtonGroup>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='game_rounds' sm={2}>Game rounds</Label>
            <Col sm={2}>
              <Input 
                type='number' 
                name='game_rounds'
                id='game_rounds'
                value={this.state.game_rounds} 
                onChange={this.update_state} 
              />
            </Col>
          </FormGroup> 
          <FormGroup row>
            <Label for='dictionaries' sm={2}>Dictionaries</Label>
            <Col sm={5}>
              <Select 
                closeMenuOnSelect={false}
                components={animatedComponents}
                name='dictionaries' 
                isMulti 
                options={dictionaries} />
            </Col>
          </FormGroup> 
          <FormGroup check>
            <Input 
              type='checkbox' 
              id='include_learned_words'
              value={this.state.include_learned_words} 
              onClick={this.handleOnClickIncludeLearned} />{' '} 
            <Label for='include_learned_words' >Include learned words</Label>
          </FormGroup>            
          <FormGroup row>
            <Col>
              <Button color='success'>Start</Button>
            </Col>
          </FormGroup>      
        </Form>
      </Container>
    );
  }
}

export default withRouter(Games);