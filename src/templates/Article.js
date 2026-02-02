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
    const { currentPageId, title } = variables;

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
                {/* Sidebar Placeholder (Left) */}
                <Box sx={{ width: '250px', display: { xs: 'none', md: 'block' }, borderRight: '1px solid #ddd' }}>
                    <Typography variant="h6" gutterBottom>
                        Contents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        (Sidebar content will be dynamic in Phase 3)
                    </Typography>
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
