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
      answers: ['one', 'two', 'three', 'four'],
      nextIsDisabled: true,
      answerIsDisabled: false,
      correct_index: -1,
      answer_index: -2
    }

    this.check_answer = this.check_answer.bind(this);
    this.current_round = this.current_round.bind(this);
    this.next_round = this.next_round.bind(this);

    this.current_round();
  }

  check_answer(answer_index) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);
    fetch('/games/check_answer', {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({
        'answer_index': answer_index
      })
    })
      .then(res => res.json())
      .then((data) => {
        if( 'correct_index' in data) {
          this.setState({
            correct_index: data.correct_index,
            answer_index: answer_index,
            answerIsDisabled: true,
            nextIsDisabled: false  
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  current_round() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);
    fetch('/games/current_round', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if( 'game_round' in data) {
          this.setState({
            game_type: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerIsDisabled: false,
            nextIsDisabled: true,
            correct_index: -1,
            answer_index: -2
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    );    
  }

  next_round() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);
    fetch('/games/next_round', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if ('redirect' in data) {
          this.props.history.push(data.redirect);  
        }
        if('game_round' in data) {
          this.setState({
            game_type: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerIsDisabled: false,
            nextIsDisabled: true,
            correct_index: -1,
            answer_index: -2
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  render() {
    const corr_ind = this.state.correct_index;
    const answer_index = this.state.answer_index;
    const answer_is_correct = (corr_ind === answer_index);
     
    const buttons_answers = this.state.answers.map(answer => 
      <p key={this.state.answers.indexOf(answer)}>
        <Button outline
          color={this.state.answers.indexOf(answer) === corr_ind 
            ? 'success' : 
              (this.state.answers.indexOf(answer) === answer_index 
                && !answer_is_correct
                ? 'warning' : 'dark') } 
          disabled={this.state.answerIsDisabled}          
          onClick={() => this.check_answer(this.state.answers.indexOf(answer))}
        >{answer}</Button>
      </p>        
    );
    
    return (
      <Container>
        <h3>{this.state.game_type}</h3>
        <br />
        <h5>{this.state.value}</h5>
        <br />
        <ul>{buttons_answers}</ul>
        <br />
        <Button outline color='info' 
          disabled={this.state.nextIsDisabled}
          onClick={this.next_round}>Next</Button>
      </Container>
    );
  }
}

export default PlayGame;