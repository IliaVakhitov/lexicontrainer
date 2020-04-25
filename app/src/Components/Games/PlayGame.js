import React from 'react';
import { Component } from 'react';
import { Button, Container, Progress, Spinner } from 'reactstrap';

import fetchData from '../../Utils/fetchData';

class PlayGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameType: 'Find Definition',
      progress: 0,
      value: '',
      answers: [],
      requestingData: true,
      correctIndex: -1,
      answerIndex: -2,
      answerGiven: false,
      firstRequest: true
    }

    this._isMounted = false;

    this.checkAnswer = this.checkAnswer.bind(this);
    this.currentRound = this.currentRound.bind(this);
    this.nextRound = this.nextRound.bind(this);
    this.fetchData = fetchData.bind(this);

  }

  componentDidMount() {
    this._isMounted = true; 
    this._isMounted && this.currentRound();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  

  checkAnswer(answerIndex) {
    this.setState({ 
      answerGiven: true
    });
    const body = JSON.stringify({
      'answer_index': answerIndex
    });
    this.fetchData('/games/check_answer', 'POST', [], body)
      .then((data) => {
        if( 'correct_index' in data) {
          this.setState({
            progress: data.progress,
            correctIndex: data.correct_index,
            answerIndex: answerIndex
          }); 
        }        
      }
    );  
  }

  currentRound() {
    this.setState({ 
      requestingData: true
    });
    this.fetchData('/games/current_round')
      .then((data) => {
        if( 'game_round' in data) {
          this.setState({
            gameType: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerGiven: false,
            requestingData: false,
            firstRequest: false
          }); 
        }        
      }
    );    
  }

  nextRound() {
    this.setState({ 
      requestingData: true
    });
    this.fetchData('/games/next_round')
      .then((data) => {
        if ('redirect' in data) {
          this.props.history.push(data.redirect);  
        }
        if('game_round' in data) {
          this.setState({
            gameType: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerGiven: false,
            requestingData: false,
            correctIndex: -1,
            answerIndex: -2
          }); 
        }        
      }
    ); 
  }
  
  render() {
    
    const correctIndex = this.state.correctIndex;
    const answerIndex = this.state.answerIndex;
    const answerGiven = this.state.answerGiven;
    const btnNextText = this.state.progress >= 100 ? 'Finish' : 'Next';

    let buttonsAnswers = [];
    this.state.answers.forEach(answer => { 
      const currentIndex = this.state.answers.indexOf(answer);
            
      let outline = true; 
      let color = 'dark';

      if (answerGiven) {
        if (currentIndex === answerIndex) {
          outline = false; 
          color = 'warning'
        }
        if (currentIndex === correctIndex) {
          color = 'success';
          outline = false;
        }
      }
      buttonsAnswers.push(
        <p key={currentIndex}>
          <Button outline={outline}
            color={color}
            disabled={this.state.answerGiven}          
            onClick={() => this.checkAnswer(currentIndex)}
          >{answer}</Button>
        </p>
      );   
    });
    
    return (
      <Container>        
        <Progress 
          color='success'
          max='100'
          value={this.state.progress}
        >
          {this.state.progress+'%'}
        </Progress>
        <h3>{this.state.gameType}</h3>
        <br />
        {this.state.firstRequest && <Spinner type='grow' color='dark' />}
        {!this.state.firstRequest && 
          <div>
            <h5>{this.state.value}</h5>
            <br />
            <ul>{buttonsAnswers}</ul>
            <br />
            <Button 
              outline 
              color='info' 
              disabled={!this.state.answerGiven}
              onClick={this.nextRound}
            >
              {btnNextText}
            </Button>
          </div>
        }
      </Container>
    );
  }
}

export default PlayGame;