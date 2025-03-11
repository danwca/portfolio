import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // ȷ���Ѿ������� Reducers

const store = configureStore({
    reducer: rootReducer,
});

export default store;