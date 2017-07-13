import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'

//Redux Reducers
import reducer from './reducers/index'

const middleware = applyMiddleware(promise(), thunk, createLogger({
  predicate: () => false //Enable to display Redux-Logger output in the console.
}))

export default createStore(reducer, middleware)
