import { combineReducers } from 'redux'
import user from './user'
import { reducer as oidcReducer } from 'redux-oidc';

export default combineReducers({


  user,
  oidcReducer


})
