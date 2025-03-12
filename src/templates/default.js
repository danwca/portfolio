import React from 'react';

const DefaultTemplate = ({ children }) => (
    <div className="default-template">
        <main>
            {children}
        </main>
        <footer>
            <p>Footer Content</p>
        </footer>
    </div>
);

export default DefaultTemplate;