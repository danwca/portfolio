import React from 'react';
import './portfolio.css';
import store from '../store/theme';
import { useSelector, Provider } from 'react-redux';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import Navbar from '../components/Navbar/Navbar';


const DefaultTemplate = ({ children, variables, sections }) => {
    const theme = useSelector((state) => {
        console.log('[Portfolio Template] Redux State:', state);
        return state;
    });

    console.log('[Portfolio Template] Received sections:', sections);
    console.log('[Portfolio Template] Received children:', children);
    console.log('[Portfolio Template] Layout:', variables?.layout);
    console.log('[Portfolio Template] Show Navigation:', variables?.showNavigation);

    // Check if we have sections to render
    const hasSections = sections && Object.keys(sections).length > 0;

    // Determine if navigation should be shown
    // Default to true for multi-page documents, but allow override via frontmatter
    const showNavigation = variables?.showNavigation !== false &&
        variables?.pages &&
        variables?.pages.length > 1;

    return (
        <div className="App" style={theme.theme}>
            {/* Original Navbar */}
            <Navbar content="" params={variables} />

            <header>
                <h1>{variables.title}</h1>
            </header>

            {/* Page Navigation - conditional based on config */}
            {showNavigation && (
                <PageNavigation
                    pages={variables.pages || []}
                    currentPageId={variables.currentPageId}
                />
            )}

            <div className="content-wrapper">
                {hasSections ? (
                    // Render sections if available
                    <>
                        {sections['hero-left'] && (
                            <div className="section-hero-left">
                                {sections['hero-left']}
                            </div>
                        )}
                        {sections['hero-right'] && (
                            <div className="section-hero-right">
                                {sections['hero-right']}
                            </div>
                        )}
                        {sections['main'] && (
                            <div className="section-main">
                                {sections['main']}
                            </div>
                        )}
                        {/* Render any other sections */}
                        {Object.entries(sections).map(([name, content]) => {
                            if (!['hero-left', 'hero-right', 'main'].includes(name)) {
                                return (
                                    <div key={name} className={`section-${name}`}>
                                        {content}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </>
                ) : (
                    // Fallback to children if no sections
                    children
                )}
            </div>
            <footer>
                <p></p>
            </footer>
        </div>
    );
};

export default DefaultTemplate;