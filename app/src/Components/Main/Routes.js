import React from 'react';
import { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Login from '../../Components/Auth/Login';
import Register from '../../Components/Auth/Register';
import Logout from '../../Components/Auth/Logout';
import Profile from '../../Components/Auth/Profile';
import Dictionaries from '../../Components/Dictionaries/Dictionaries';
import Dictionary from '../../Components/Dictionaries/Dictionary';
import Words from '../../Components/Words/Words';
import Games from '../../Components/Games/Games';
import PlayGame from '../../Components/Games/PlayGame';
import Statistic from '../../Components/Games/Statistic';
import Error from '../../Utils/Error';

import Index from './Index';


class Routes extends Component {
  
  render() {
    return(
      <Switch>
        <Route  
          exact
          path='/' 
          render={(props) => 
            <Index {...props} 
              username={this.props.username} 
              showMessage={(message) => this.props.showMessage(message)} 
            />
          } 
        />
        <Route 
          path='/login' 
          render={(props) => 
            <Login {...props} 
              onLogin={this.props.onLogin()} 
            />
          } 
        />
        <Route 
          path='/logout' 
          render={(props) => 
            <Logout {...props} 
              onLogout={this.props.onLogout()} 
            />
          } 
        />
        <Route 
          path='/profile' 
          render={(props) => 
            <Profile {...props}  
              username={this.props.username}
            />
          } 
        />
        <Route 
          path='/register' 
          render={(props) => 
            <Register {...props}  
              onLogin={this.props.onLogin()} 
            /> 
          }
        />
        <Route 
          path='/words' 
          render={(props) => 
            <Words {...props} 
              showMessage={(message) => this.props.showMessage(message)} 
            /> 
          }
        />
        <Route 
          path='/games' 
          render={(props) => 
            <Games {...props}  
              showMessage={(message) => this.props.showMessage(message)} 
            /> 
          }
        /> 
        <Route 
          path='/statistic' 
          render={(props) => 
            <Statistic {...props}  
              showMessage={(message) => this.props.showMessage(message)} 
            /> 
          }
        />
        <Route 
          path='/play' 
          render={(props) => 
            <PlayGame {...props}   
              showMessage={(message) => this.props.showMessage(message)} 
            /> 
          }
        /> 
        <Route 
          path='/dictionaries' 
          render={(props) => 
            <Dictionaries {...props} 
              showMessage={(message) => this.props.showMessage(message)}  
            /> 
          }
        />
        <Route 
          path='/dictionary' 
          render={(props) => 
            <Dictionary {...props}   
              showMessage={(message) => this.props.showMessage(message)}  
            /> 
          }
        />
        <Route path='/error' component={Error} />                   
      </Switch>
    );
  }
}

export default Routes;