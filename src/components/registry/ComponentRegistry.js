// Component Registry for Injectable Markdown Components
import React from 'react';

// Import markdown-compatible components
// These will be created as we build them out

/**
 * Component Registry
 * Maps component names to React components with prop definitions
 */
export const componentRegistry = {
    // Example: Typewriter component
    Typewriter: {
        component: null, // Will be lazy-loaded
        path: 'markdown/Typewriter',
        props: {
            items: { type: 'array', required: true, description: 'Array of strings to type' },
            loop: { type: 'boolean', default: false, description: 'Loop the animation' },
            prefix: { type: 'string', default: '', description: 'Text before typed content' }
        },
        description: 'Animated typing effect component'
    },

    Avatar: {
        component: null,
        path: 'markdown/Avatar',
        props: {
            src: { type: 'string', required: true, description: 'Image source URL' },
            size: { type: 'string', default: 'medium', description: 'Size: small, medium, large' },
            animated: { type: 'boolean', default: false, description: 'Enable animation' },
            border: { type: 'string', default: 'none', description: 'Border color' }
        },
        description: 'Profile avatar image component'
    },

    SocialLinks: {
        component: null,
        path: 'SocialLinks/SocialLinks',
        props: {
            className: { type: 'string', default: '', description: 'CSS class name' },
            size: { type: 'string', default: 'medium', description: 'Icon size' }
        },
        description: 'Social media links component'
    },

    Button: {
        component: null,
        path: 'UI/Button',
        props: {
            href: { type: 'string', required: false, description: 'Link URL' },
            variant: { type: 'string', default: 'primary', description: 'Button style variant' },
            target: { type: 'string', default: '_self', description: 'Link target' }
        },
        description: 'Call-to-action button component'
    },

    Highlight: {
        component: null,
        path: 'markdown/Highlight',
        props: {
            text: { type: 'string', required: true, description: 'Text to highlight' },
            color: { type: 'string', default: 'primary', description: 'Highlight color' }
        },
        description: 'Highlighted text span component'
    },

    PageNavigation: {
        component: null,
        path: 'PageNavigation/PageNavigation',
        props: {
            pages: { type: 'array', required: false, description: 'Array of page objects' },
            currentPageId: { type: 'string', required: false, description: 'Current page ID' }
        },
        description: 'Multi-page navigation tabs component'
    }
};

/**
 * Load a component dynamically
 * @param {string} componentName - Name of the component
 * @returns {Promise<React.Component>} - Loaded component
 */
export const loadComponent = async (componentName) => {
    const registration = componentRegistry[componentName];

    if (!registration) {
        console.warn(`Component ${componentName} not found in registry`);
        return null;
    }

    // Return cached component if already loaded
    if (registration.component) {
        return registration.component;
    }

    // Load component dynamically
    try {
        console.log(`[ComponentRegistry] Loading component ${componentName} from ../${registration.path}`);
        const module = await import(`../${registration.path}`);
        registration.component = module.default;
        console.log(`[ComponentRegistry] Successfully loaded ${componentName}:`, registration.component);
        return registration.component;
    } catch (error) {
        console.error(`[ComponentRegistry] Error loading component ${componentName} from ${registration.path}:`, error);
        return null;
    }
};

/**
 * Validate component props against registry
 * @param {string} componentName - Name of the component
 * @param {Object} props - Props to validate
 * @returns {Object} - { valid, errors, warnings }
 */
export const validateComponentProps = (componentName, props) => {
    const registration = componentRegistry[componentName];

    if (!registration) {
        return {
            valid: false,
            errors: [`Component ${componentName} not found in registry`],
            warnings: []
        };
    }

    const errors = [];
    const warnings = [];
    const propDefs = registration.props;

    // Check required props
    for (const [propName, propDef] of Object.entries(propDefs)) {
        if (propDef.required && !(propName in props)) {
            errors.push(`Required prop '${propName}' missing for component ${componentName}`);
        }
    }

    // Check prop types (basic validation)
    for (const [propName, propValue] of Object.entries(props)) {
        const propDef = propDefs[propName];

        if (!propDef) {
            warnings.push(`Unknown prop '${propName}' for component ${componentName}`);
            continue;
        }

        const actualType = Array.isArray(propValue) ? 'array' : typeof propValue;
        if (propDef.type !== actualType && propValue !== undefined) {
            warnings.push(`Prop '${propName}' expected type ${propDef.type} but got ${actualType}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Get component documentation
 * @param {string} componentName - Name of the component
 * @returns {Object} - Component documentation
 */
export const getComponentDocs = (componentName) => {
    const registration = componentRegistry[componentName];

    if (!registration) {
        return null;
    }

    return {
        name: componentName,
        description: registration.description,
        props: Object.entries(registration.props).map(([name, def]) => ({
            name,
            type: def.type,
            required: def.required || false,
            default: def.default,
            description: def.description
        }))
    };
};

/**
 * List all available components
 * @returns {Array} - Array of component names
 */
export const listComponents = () => {
    return Object.keys(componentRegistry);
};

export default {
    componentRegistry,
    loadComponent,
    validateComponentProps,
    getComponentDocs,
    listComponents
};
