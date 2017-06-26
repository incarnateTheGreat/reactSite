import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, browserHistory } from 'react-router';
import { createStore, applyMiddleware, compose, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import * as actionCreators from './actions/gameStatus';

import Layout from "./pages/Layout";
import Todos from "./pages/Todos";
import Home from "./pages/Home";
import What from "./pages/What";
import Who from "./pages/Who";
import Where from "./pages/Where";
import Featured from "./pages/Featured";
import Scores from "./pages/Scores_NHL";
import Scores_MLB from "./pages/Scores_MLB";

//Redux Reducers
import rootReducer from './reducers/index';
import gameStatus from '../testData/gameStatusData';

//Create object for default data
const defaultState = {
  gameStatus
};

const store = createStore(rootReducer, defaultState),
      history = syncHistoryWithStore(browserHistory, store),
      app = document.getElementById('app');

function mapStateToProps(state) {
  return {
    gameStatus: state.gameStatus
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const testApp = connect(mapStateToProps, mapDispatchToProps)(Layout);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={testApp}>
        <IndexRoute component={Home}></IndexRoute>
        <Route path="Todos" component={Todos}></Route>
        <Route path="What(/:ever)" component={What}></Route>
        <Route path="Who" component={Who}></Route>
        <Route path="Where" component={Where}></Route>
        <Route path="Featured" component={Featured}></Route>
        <Route path="Scores_NHL" component={Scores}></Route>
        <Route path="Scores_MLB" component={Scores_MLB}></Route>
      </Route>
    </Router>
  </Provider>, app);
