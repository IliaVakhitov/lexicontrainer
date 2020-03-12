import React from 'react';
import { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../../Components/Auth/Login';
import Profile from '../../Components/Auth/Profile';
import Dictionaries from '../../Components/Dictionaries/Dictionaries';
import Words from '../../Components/Words/Words';
import Games from '../../Components/Games/Games';
import Main from './Main';

class Routes extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Switch>
        <Route exact path="/" render={(props) => <Main {...props} username={this.props.username} />} />
        <Route path="/words" component={Words} />
        <Route path="/games" component={Games} />
        <Route path="/dictionaries" component={Dictionaries} />
        <Route path="/login" render={(props) => <Login {...props} onLogin={this.props.onLogin()} />} />
        <Route path="/profile" render={(props) => <Profile {...props} 
            username={this.props.username} 
            token={this.props.token}/>} />
      </Switch>
    );
  }
}

export default Routes;