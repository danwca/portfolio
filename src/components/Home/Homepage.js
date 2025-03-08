import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Homepage.css'; // Add styling if needed

const Homepage = () => {
    const [readmeContent, setReadmeContent] = useState('');

    useEffect(() => {
        // Fetch the README.md file from the GitHub repository
        fetch('https://api.github.com/repos/danwca/portfolio/docs/myportfolio', {
            headers: {
                Accept: 'application/vnd.github.v3.raw', // Request raw content
            },
        })
            .then((response) => response.text())
            .then((data) => setReadmeContent(data))
            .catch((error) => console.error('Error fetching README:', error));
    }, []);

    return (
        <div className="home-container">
            <ReactMarkdown>{readmeContent}</ReactMarkdown>
        </div>
    );
};

export default Homepage;