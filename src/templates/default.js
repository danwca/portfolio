import React from 'react';

const DefaultTemplate = ({ children }) => (
    <div className="default-template">
        <header>
            <h1>Default Template</h1>
        </header>
        <main>
            {children}
        </main>
        <footer>
            <p>Footer Content</p>
        </footer>
    </div>
);

export default DefaultTemplate;