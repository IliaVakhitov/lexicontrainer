import React from 'react';
import { Component } from 'react';
import { Input, Label, Col, 
  FormGroup, Form, ButtonGroup, Button, Container } from 'reactstrap';
import Select from 'react-select';

class Games extends Component {
  constructor(props){
    super(props);

    this.state = {
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
    this.setGameRounds = this.setGameRounds.bind(this);
    this.handleOnClickIncludeLearned = this.handleOnClickIncludeLearned.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  setGameType(new_game_type) {
    this.setState({game_type: new_game_type});
  }

  setGameRounds(event) {
    this.setState({game_rounds: event.target.value});
  }

  handleOnClickIncludeLearned() {
    this.setState({include_learned_words: !this.state.include_learned_words});
  }

  handleSubmit(event) {
    event.preventDefault();
    // TODO validate form data
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);
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
        if ('token' in data) {          
          this.setState({
            username: '',
            password: ''
          });
          this.props.onLogin(data.token, data.username);
          this.props.history.push('/');
        }
      },
      (error) => {
        console.log(error);
      }
    );      
  }

  render() {
    const dictionaries = this.state.dictionaries;

    return (
      <Container>
        <h3>Define game</h3>
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
                onChange={this.setGameRounds} 
                  />
            </Col>
          </FormGroup> 
          <FormGroup row>
            <Label for='dictionaries' sm={2}>Dictionaries</Label>
            <Col sm={5}>
              <Select name='dictionaries' isMulti options={dictionaries} />
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
              <Button>Start</Button>
            </Col>
          </FormGroup>      
        </Form>
      </Container>
    );
  }
}

export default Games;