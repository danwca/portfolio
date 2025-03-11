import { combineReducers } from 'redux';
import uiColorReducer from './uiColorReducer';
import nonThemeColorReducer from './nonThemeColorReducer';

const rootReducer = combineReducers({
    uiColor: uiColorReducer,
    nonThemeColor: nonThemeColorReducer,
});

export default rootReducer;