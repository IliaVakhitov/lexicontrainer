import React from 'react';
import { Component } from "react";
import { Spinner, ListGroup, ListGroupItem } from 'reactstrap';

class Symonyms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requestError: false,
      symonyms: []
    };
    
    this._isMounted = false; 

    this.getSymonymsList = this.getSymonymsList.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.fetchData();    
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  fetchData() {
    const spelling = this.props.word.spelling;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/get_synonyms', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'spelling': spelling
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          this.setState({
            requestError: true
          }); 
          return;
        }       
        if ('message' in data) {
          console.log(data);
          this.setState({
            requestError: true
          }); 
          return; 
        }
        this.setState({
          symonyms: data.synonyms
        });
      },
      (error) => {
        console.log(error);
        this.setState({
          requestError: true
        }); 
      }
    ); 
  }

  getSymonymsList() {
    let i = 1;
    if (this.state.requestError) {
      return (
        <ListGroupItem key={i++}>
          <p>Couldn't get symonyms</p>          
        </ListGroupItem>
      );
    } 
    const symonyms = this.state.symonyms;
    if (!symonyms || symonyms.length === 0) {
      return (
        <ListGroupItem key={i++}>
          <Spinner type='grow' color='dark' />
        </ListGroupItem>          
      );
    }
    
    return symonyms.map(symonym =>
      <ListGroupItem key={i++}>
        {symonym}
      </ListGroupItem>
    );
  }

  render() {
    return (
      <ListGroup>
        {this.getSymonymsList()}
      </ListGroup>
    );
  }
}

export default Symonyms;
