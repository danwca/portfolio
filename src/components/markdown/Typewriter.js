// Typewriter Component - Animated typing effect
import React, { useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect/dist/core';
import { useSelector } from 'react-redux';

const TypewriterComponent = ({ items = [], loop = false, prefix = '' }) => {
    const typerRef = useRef(null);
    const uiColor = useSelector(state => state.uiColor);

    useEffect(() => {
        if (typerRef.current && items.length > 0) {
            new Typewriter(typerRef.current, {
                strings: items,
                autoStart: true,
                loop: loop,
                pauseFor: 1000
            });
        }
    }, [items, loop]);

    return (
        <span className="typewriter-wrapper">
            {prefix && <span>{prefix}</span>}
            <span ref={typerRef} style={{ color: uiColor }}></span>
        </span>
    );
};

export default TypewriterComponent;
