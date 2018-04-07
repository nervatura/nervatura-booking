import { combineReducers } from 'redux'

import { conf } from './config/setting/config';
import * as app_ from './actions/app';
import * as tool_ from './actions/tool';
import * as api_ from './actions/api';

const assign = Object.assign //|| require('object.assign');

const actions = () => {
  return {
    app: app_,
    api: api_,
    tool: tool_
  }}

const store = (state = conf, action) => {
  switch (action.type) {
    
  case "APP_DATA":
    return assign({}, state, {
      [action.key]: action.data
    });

  default:
    return state;
  }
}

const rootReducer = combineReducers({
  store,
  actions
})

export default rootReducer