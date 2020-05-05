import React from 'react';
import { Component } from 'react';
import { Button, Container, Progress, Spinner } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import fetchData from '../../Utils/fetchData';

class PlayGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameType: '',
      progress: 0,
      value: '',
      answers: [],
      requestingData: true,
      correctIndex: -1,
      answerIndex: -2,
      answerGiven: false,
      gameData: [],
      currentRound: 0,
      totalRounds: 0,
      correctAnswers: 0,
      userResult: []
    }

    this._isMounted = false;

    this.checkAnswer = this.checkAnswer.bind(this);
    this.nextRound = this.nextRound.bind(this);
    this.fetchData = fetchData.bind(this);

  }

  componentDidMount() {
    this._isMounted = true; 
    this._isMounted && this.currentGame();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.saveCurrentGame();
  }
  
  currentGame() {
    this.setState({ 
      requestingData: true
    });
    this.fetchData('/games/current_game')
      .then((data) => {
        if('game_rounds' in data) {
          const gameRound = data.game_rounds[data.current_round];
          this.setState({
            value: gameRound.value,
            answers: gameRound.answers,
            gameType: data.game_type,
            gameData: data.game_rounds,
            progress: data.progress,
            currentRound: data.current_round,
            totalRounds: data.total_rounds,
            correctAnswers: data.correct_answers,
            answerGiven: false,
            requestingData: false
          }); 
        }        
      }
    );    
  }

  saveCurrentGame() {
    const body = JSON.stringify({
      current_round: this.state.currentRound,
      correct_answers: this.state.correctAnswers,
      words_update: this.state.userResult  
    });
    this.fetchData('/games/save_current_game', 'POST', [], body)
      .then((data) => {
        // TODO show message
        console.log(data);
      });   
  }  

  checkAnswer(answerIndex) {
    const currentRound = this.state.currentRound + 1;
    const gameRound = this.state.gameData[this.state.currentRound];
    const isCorrect = answerIndex === gameRound.correct_index;
    const progress = 
      this.state.totalRounds > 0 
      ? currentRound / this.state.totalRounds * 100
      : 0;

    let correctAnswers = this.state.correctAnswers;
    correctAnswers += isCorrect ? 1 : 0;
    let userResult = this.state.userResult;
    userResult.push({
      'word_id': gameRound.word_id,
      'correct': isCorrect 
    });
    this.setState({ 
      answerGiven: true,
      correctIndex: gameRound.correct_index,
      correctAnswers: correctAnswers,
      answerIndex: answerIndex,
      currentRound: currentRound,
      progress: progress.toFixed(2),
      userResult: userResult
    });
  }
  
  nextRound() {
    if (this.state.currentRound === this.state.totalRounds) {
      this.props.history.push({
        pathname:'/statistic', 
        state: { 
          gameType: this.state.gameType, 
          totalRounds: this.state.totalRounds, 
          correctAnswers: this.state.correctAnswers 
        }
      });
      return;
    }

    const gameRound = this.state.gameData[this.state.currentRound];
    this.setState({
      value: gameRound.value,
      answers: gameRound.answers,
      answerGiven: false,
      correctIndex: -1,
      answerIndex: -2
    });       
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
        {this.state.requestingData && 
          <Spinner type='grow' color='dark' />
        }
        {!this.state.requestingData && 
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

export default withRouter(PlayGame);