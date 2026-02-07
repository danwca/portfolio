// Highlight Component - Highlighted text span
import React from 'react';
import { useSelector } from 'react-redux';

const Highlight = ({ text, color = 'primary' }) => {
    const uiColor = useSelector(state => state.uiColor);

    const colorMap = {
        primary: uiColor,
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    const highlightColor = colorMap[color] || color;

    return (
        <span style={{ color: highlightColor, fontWeight: 'bold' }}>
            {text}
        </span>
    );
};

export default Highlight;
