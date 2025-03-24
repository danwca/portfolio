// /utils/config.js

/**
 * Singleton pattern to fetch and cache the configuration from config.json.
 * @returns {Promise<Object>} - The configuration object.
 */
let cachedConfig = null; // Cache for the configuration

export async function getConfig() {
    // If the configuration is already cached, return it
    if (cachedConfig) {
        return cachedConfig;
    }

    try {
        // Fetch config.json from the public folder
        const response = await fetch('./config.json');
        const config = await response.json();
		console.log(config)
        // Cache the configuration
        cachedConfig = config;

        return config;
    } catch (error) {
        console.error('Failed to fetch config.json:', error);
        throw error;
    }
}

// Export the configuration as a promise
export const config = getConfig();