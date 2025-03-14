import React from 'react';

const DefaultTemplate = ({ children, variables }) => {
    // 打印传入的参数
    //console.log('Template Variables:', variables);

    return (
        <div className="default-template">
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