import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/theme'; // 确保已经创建了 Redux Store

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);