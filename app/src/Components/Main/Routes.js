import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../../Components/Auth/Login';
import Profile from '../../Components/Auth/Profile';
import Dictionaries from '../../Components/Dictionaries/Dictionaries';
import Words from '../../Components/Words/Words';
import Games from '../../Components/Games/Games';
import Main from './Main';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Main} />
    <Route path="/words" component={Words} />
    <Route path="/games" component={Games} />
    <Route path="/dictionaries" component={Dictionaries} />
    <Route path="/login" component={Login} />
    <Route path="/profile" component={Profile} />
  </Switch>
);

export default Routes;