import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // 确保已经定义了 Reducers

const store = configureStore({
    reducer: rootReducer,
});

export default store;