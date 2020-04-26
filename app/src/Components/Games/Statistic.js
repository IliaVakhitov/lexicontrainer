import React from 'react';
import { Component } from 'react';
import { Container } from 'reactstrap';

import fetchData from '../../Utils/fetchData';

class Statistic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      total_rounds: 0,
      correct_answers: 0,
      game_type: ''  
    };

    this._isMounted = false;

    this.fetchData = fetchData.bind(this);
    
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.get_statistic();
  }

  get_statistic() {
    this.fetchData('/games/statistic', 'POST') 
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