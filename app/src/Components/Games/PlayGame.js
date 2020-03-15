import React from 'react';
import { Component } from 'react';
import { Button, Container } from 'reactstrap';


class PlayGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      game_type: 'Find Definition',
      progress: 0,
      value: 'value',
      answers: ['one', 'two', 'three', 'four']
    }

    this.check_answer = this.check_answer.bind(this);
    this.current_round = this.current_round.bind(this);
    this.next_round = this.next_round.bind(this);
  }

  check_answer() {

  }

  current_round() {
    
  }

  next_round() {
    
  }

  render() {
    
    const buttons_answers = this.state.answers.map(answer => 
      <p>
        <Button outline color='secondary' 
          key={this.state.answers.indexOf(answer)}
          onClick={() => this.check_answer(this.state.answers.indexOf(answer))}
        >{answer}</Button>
      </p>        
    );
    
    return (
      <Container>
        <p>{this.state.game_type}</p>
        <br />
        <p>{this.state.value}</p>
        <br />
        <ul>{buttons_answers}</ul>
      </Container>
    );
  }
}

export default PlayGame;