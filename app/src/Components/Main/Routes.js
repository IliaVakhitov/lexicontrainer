import React from 'react';
import { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../../Components/Auth/Login';
import Logout from '../../Components/Auth/Logout';
import Profile from '../../Components/Auth/Profile';
import Dictionaries from '../../Components/Dictionaries/Dictionaries';
import Words from '../../Components/Words/Words';
import Games from '../../Components/Games/Games';
import PlayGame from '../../Components/Games/PlayGame';
import Main from './Main';

class Routes extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Switch>
        <Route exact path='/' 
          render={(props) => <Main {...props} 
            username={this.props.username} />} />
        <Route path='/words' 
          render={(props) => <Words {...props} 
            token={this.props.token} />}/>
        <Route path='/games' 
          render={(props) => <Games {... props}
            token={this.props.token} />} />
        <Route path='/play' 
          render={(props) => <PlayGame {... props}
            token={this.props.token} />} />
        <Route path='/dictionaries' 
          render={(props) => <Dictionaries 
            token={this.props.token} />} />
        <Route path='/login' 
          render={(props) => <Login {...props} 
            onLogin={this.props.onLogin()} />} />
        <Route path='/logout' 
          render={(props) => <Logout {...props} 
            onLogout={this.props.onLogout()} />} />
        <Route path='/profile' 
          render={(props) => <Profile {...props}  
            token={this.props.token}/>} />
      </Switch>
    );
  }
}

export default Routes;