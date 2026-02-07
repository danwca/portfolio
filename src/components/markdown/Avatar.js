// Avatar Component - Profile image with animations
import React from 'react';
import { useSelector } from 'react-redux';
import './Avatar.css';

const Avatar = ({ src, size = 'medium', animated = false, border = 'none' }) => {
    const uiColor = useSelector(state => state.uiColor);

    const sizeMap = {
        small: '100px',
        medium: '200px',
        large: '300px'
    };

    const avatarSize = sizeMap[size] || size;

    const borderColor = border === 'primary' ? uiColor : border;

    const style = {
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        objectFit: 'cover',
        border: border !== 'none' ? `4px solid ${borderColor}` : 'none',
        animation: animated ? 'float 3s ease-in-out infinite' : 'none'
    };

    return (
        <img
            src={src}
            alt="Avatar"
            style={style}
            className="avatar-component"
        />
    );
};

export default Avatar;
