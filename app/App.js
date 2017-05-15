import React, {Component} from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, Link  } from "react-router";
import TwitterContainer from './TwitterContainer'
import UserPage from './UserPage'
import TweetDetail from './TweetDetail'
import Signup from './Signup'
import Login from './Login'
import TwitterApp from './TwitterApp'
var createBrowserHistory = require('history/createBrowserHistory')
// var createHashHistory = require('history/createHashHistory')



// render(<UserPageContainer/>, document.getElementById('root'));
//render(<TwitterContainer/>, document.getElementById('root'));

render((
  <Router history={ browserHistory }>
    <Router component={TwitterApp} path="/">
      {/* <Route path="/"  component={TwitterContainer}>
        <Route path="/:user/:tweet" component={TweetDetail}/>
      </Route> */}
      <Route path="/signup" component={Signup}/>
      <Route path="/login" component={Login}/>
      <Route path="/followers" component={UserPage} tab="followers"/>
      <Route path="/following" component={UserPage} tab="followings"/>
      <Route path="/:user" component={UserPage} tab="tweets">
        <Route path="/:user/:tweet" component={TweetDetail}/>
      </Route>

      {/* <Route path="/:user/:tweet" component={TweetDetail}/> */}
      {/* <Route path="*" component={Login} status={404}/> */}
    </Router>
  </Router>
), document.getElementById('root'));
