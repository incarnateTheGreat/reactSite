import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import gameStatus from './gameStatus';

const rootReducer = combineReducers({
  gameStatus, routing: routerReducer
});

export default rootReducer;
