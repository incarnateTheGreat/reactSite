import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'

//Reducers
import gameStatus from './gameStatus'
import loadGameData from './loadGameData'

const rootReducer = combineReducers({
  gameStatus,
  loadGameData,
  routing: routerReducer
});

export default rootReducer
