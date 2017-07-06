import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'

//Reducers
import gameStatus from './gameStatus'

const rootReducer = combineReducers({
  gameStatus, routing: routerReducer
});

export default rootReducer
