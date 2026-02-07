// Page Navigation Component for Multi-Page Markdown Files
import React from 'react';
import './PageNavigation.css';

const PageNavigation = ({ pages, currentPageId }) => {
    if (!pages || pages.length <= 1) {
        return null; // Don't show navigation if only one page
    }

    const handlePageChange = (pageId) => {
        const url = new URL(window.location);
        url.searchParams.set('page', pageId);
        window.location.href = url.toString();
    };

    return (
        <div className="page-navigation">
            <div className="page-tabs">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        className={`page-tab ${page.id === currentPageId ? 'active' : ''}`}
                        onClick={() => handlePageChange(page.id)}
                    >
                        {page.frontmatter.title || page.id}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PageNavigation;
