import React from 'react';
import './default/app.css';
import store from '../store/theme'; // 确保已经创建了 Redux Store
import { useSelector, Provider } from 'react-redux';


const DefaultTemplate = ({ children, variables }) => {
    // 打印传入的参数
    //console.log('Template Variables:', variables);
    const theme = useSelector((state) => {
        console.log('Redux State:', state);
        return state;
    });

    return (
        <div className="App" style={theme.theme}>
            <header>
                <h1> {variables.title}</h1>
            </header>
            <main>
                {children}
            </main>
            <footer>
                <p>Footer Content</p>
            </footer>
        </div>
    );
};

export default DefaultTemplate;