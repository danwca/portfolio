import React from 'react';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

/**
 * Article Template
 * Optimized for documentation and articles.
 * Features:
 * - Breadcrumb navigation
 * - Clean typography
 * - Placeholder for Sidebar (Phase 3)
 */
const ArticleTemplate = ({ children, variables }) => {
    const { currentPageId, title, navigation } = variables;
    console.log('[ArticleTemplate] Navigation Prop:', navigation);

    // Simple breadcrumb logic (mockup)
    const breadcrumbs = [
        <Link underline="hover" key="1" color="inherit" href="/">
            Home
        </Link>,
        <Typography key="3" color="text.primary">
            {currentPageId || 'Article'}
        </Typography>,
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 4 }}>
                {/* Sidebar (Left) */}
                <Box sx={{ width: '250px', display: { xs: 'none', md: 'block' }, borderRight: '1px solid #ddd' }}>
                    <Typography variant="h6" gutterBottom>
                        Contents
                    </Typography>

                    {navigation && navigation.items && (
                        <nav>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {navigation.items.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: '8px' }}>
                                        <Link href={item.path} underline="hover" color="text.primary">
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {navigation.type === 'auto' && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                    (Auto-generated)
                                </Typography>
                            )}
                        </nav>
                    )}
                </Box>

                {/* Main Content (Right) */}
                <Box sx={{ flexGrow: 1 }}>
                    <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
                        {breadcrumbs}
                    </Breadcrumbs>

                    {title && (
                        <Typography variant="h3" component="h1" gutterBottom>
                            {title}
                        </Typography>
                    )}

                    <div className="markdown-body">
                        {children}
                    </div>
                </Box>
            </Box>
        </Container>
    );
};

export default ArticleTemplate;
