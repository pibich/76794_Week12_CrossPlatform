// rootReducer.ts
import { combineReducers } from 'redux';
import counterReducer from './slice/counter.slice';
import uploadStatsReducer from './slice/uploadStats.slice';

const rootReducer = combineReducers({
  counter: counterReducer,
  uploadStats: uploadStatsReducer,
});

export default rootReducer;