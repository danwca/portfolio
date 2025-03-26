// components/system/Pagination.js
import React from 'react';
import { useSelector } from 'react-redux';

const Pagination = ({ variables }) => {
    const { currentPageId, totalPages } = variables;
    
    // In a real implementation, you would have access to all page IDs
    // For simplicity, we'll just show previous/next buttons
    
    return (
        <div className="pagination">
            <button 
                onClick={() => {
                    // Navigate to previous page
                    window.location.search = `?page=page-${parseInt(currentPageId.split('-')[1]) - 1}`;
                }}
                disabled={currentPageId === 'page-1'}
            >
                Previous
            </button>
            
            <span>Page {currentPageId.split('-')[1]} of {totalPages}</span>
            
            <button 
                onClick={() => {
                    // Navigate to next page
                    window.location.search = `?page=page-${parseInt(currentPageId.split('-')[1]) + 1}`;
                }}
                disabled={currentPageId === `page-${totalPages}`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;