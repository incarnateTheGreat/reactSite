import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { compose, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import * as actionCreators from './actions/gameStatus';

import axios from 'axios';

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Featured from "./pages/Featured";
import Scores_NHL from "./pages/Scores_NHL";
import Scores_MLB from "./pages/Scores_MLB";

//Redux Store
import store from './store';

//Create object for default data
const history = syncHistoryWithStore(browserHistory, store),
      app = document.getElementById('app');

function mapStateToProps(state) {
  return {
    gameStatus: state.gameStatus
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Router history={browserHistory}>
        <Route component={App}>
          <Route path="/" component={Home}/>
          <Route path="/Featured" component={Featured} />
          <Route path="/Scores_NHL" component={Scores_NHL} />
          <Route path="/Scores_MLB" component={Scores_MLB} />
        </Route>
      </Router>
    </BrowserRouter>
  </Provider>, app);
