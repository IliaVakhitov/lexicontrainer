import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

class Statistic extends Component {
  
  render() {
    return(
      <Container>
        <h4>Game completed!</h4>
        <p>{this.props.location.state.gameType}</p>
        <p>Total rounds {this.props.location.state.totalRounds}</p>  
        <p>Correct answers {this.props.location.state.correctAnswers}</p>  
      </Container>
    );
  }
}

export default Statistic;