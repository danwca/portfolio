import React from 'react';
import { Container, Typography, Box } from '@mui/material';

/**
 * Section Index Template
 * Optimized for listing items (e.g., Blog roots, Product lists).
 * Currently renders the standard content but adds a specific header style.
 */
const SectionIndexTemplate = ({ children, variables }) => {
    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom color="primary">
                    {variables.title || "Section Index"}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                    Explore our content
                </Typography>
            </Box>

            <div className="section-content">
                {children}
            </div>
        </Container>
    );
};

export default SectionIndexTemplate;
