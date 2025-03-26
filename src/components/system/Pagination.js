// components/system/Pagination.js
import React from 'react';
import { useSelector } from 'react-redux';

const Pagination = ({content, variables }) => {
    // Destructure with default values to avoid undefined errors
    const { currentPageId = '', totalPages = 0 } = variables || {};
    console.log('Pagination', currentPageId,totalPages);
    
    // Return nothing if:
    // 1. currentPageId is not in the expected format (page-X)
    // 2. totalPages is not a positive number
    // 3. There's only one page (no need for pagination)
    if (!/^page-\d+$/.test(currentPageId) || 
        !Number.isInteger(totalPages) || 
        totalPages <= 1) {
        return null;
    }
    
    // Extract page number safely
    const currentPageNum = parseInt(currentPageId.split('-')[1], 10);
    console.log('Pagination', currentPageNum,totalPages);
    // Additional safety check in case parsing fails
    if (isNaN(currentPageNum) || currentPageNum < 1 || currentPageNum > totalPages) {
        return null;
    }
    
    return (
        <div className="pagination">
            <button 
                onClick={() => {
                    // Navigate to previous page
                    window.location.search = `?page=page-${currentPageNum - 1}`;
                }}
                disabled={currentPageNum === 1}
            >
                Previous
            </button>
            
            <span>Page {currentPageNum} of {totalPages}</span>
            
            <button 
                onClick={() => {
                    // Navigate to next page
                    window.location.search = `?page=page-${currentPageNum + 1}`;
                }}
                disabled={currentPageNum === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;