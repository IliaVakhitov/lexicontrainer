import React from 'react';
import { Component } from 'react';
import { Button, Container, Progress, Spinner } from 'reactstrap';


class PlayGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameType: 'Find Definition',
      progress: 0,
      value: '',
      answers: [],
      fetchInProgress: true,
      correctIndex: -1,
      answerIndex: -2,
      answerGiven: false,
      firstRequest: true
    }

    this._isMounted = false;

    this.checkAnswer = this.checkAnswer.bind(this);
    this.currentRound = this.currentRound.bind(this);
    this.nextRound = this.nextRound.bind(this);

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
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/check_answer', {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({
        'answer_index': answerIndex
      })
    })
      .then(res => res.json())
      .then((data) => {
        if( 'correct_index' in data) {
          this.setState({
            progress: data.progress,
            correctIndex: data.correct_index,
            answerIndex: answerIndex
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    );  
  }

  currentRound() {
    this.setState({ 
      fetchInProgress: true
    });
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    fetch('/games/current_round', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if( 'game_round' in data) {
          this.setState({
            gameType: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerGiven: false,
            fetchInProgress: false,
            firstRequest: false
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    );    
  }

  nextRound() {
    this.setState({ 
      fetchInProgress: true
    });
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
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
            gameType: data.game_type,
            progress: data.progress,
            value: data.game_round.value,
            answers: data.game_round.answers,
            answerGiven: false,
            fetchInProgress: false,
            correctIndex: -1,
            answerIndex: -2
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    ); 
  }
  // TODO Find a way to make it simpler
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