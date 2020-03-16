import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';


class Statistic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      total_rounds: 0,
      correct_answers: 0,
      game_type: ''  
    };

    this.get_statistic();
  }

  get_statistic() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.token);
    fetch('/games/statistic', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then((data) => {
        if ('redirect' in data) {
          this.props.history.push(data.redirect);  
        }
        if('total_rounds' in data) {
          this.setState({
            total_rounds: data.total_rounds,
            correct_answers: data.correct_answers,
            game_type: data.game_type
          }); 
        }        
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  render() {
    return(
      <Container>
        <h4>Game completed!</h4>
        <p>{this.state.game_type}</p>
        <p>Total rounds {this.state.total_rounds}</p>  
        <p>Correct answers {this.state.correct_answers}</p>  
      </Container>
    );
  }
}

export default Statistic;