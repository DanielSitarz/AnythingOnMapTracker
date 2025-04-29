// Configuration Storage using localStorage

const CONFIG_STORAGE_KEY = 'thingTrackerConfig';

/**
 * Saves the entire configuration object to localStorage.
 * @param {Object} config The configuration object to save.
 */
function saveConfig(config) {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        console.log("Configuration saved to localStorage.");
    } catch (error) {
        console.error("Error saving configuration to localStorage:", error);
    }
}

/**
 * Loads the configuration object from localStorage.
 * @returns {Object} The loaded configuration object, or a default empty object if none exists.
 */
function loadConfig() {
    try {
        const configString = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (configString) {
            const config = JSON.parse(configString);
            console.log("Configuration loaded from localStorage:", config);
            return config;
        }
    } catch (error) {
        console.error("Error loading configuration from localStorage:", error);
    }
    console.log("No configuration found in localStorage. Returning default.");
    return {}; // Return default empty object if no config is found or an error occurs
}

/**
 * Gets the name of the selected data provider.
 * @returns {string|null} The name of the selected provider, or null if not set.
 */
function getSelectedProviderName() {
    const config = loadConfig();
    return config.selectedProvider || null;
}

/**
 * Sets the name of the selected data provider and saves the config.
 * @param {string} providerName The name of the provider to select.
 */
function setSelectedProviderName(providerName) {
    const config = loadConfig();
    config.selectedProvider = providerName;
    saveConfig(config);
    console.log("Selected provider set to:", providerName);
}

/**
 * Gets the configuration object for a specific provider.
 * @param {string} providerName The name of the provider.
 * @returns {Object|null} The provider's configuration object, or null if not found.
 */
function getProviderConfig(providerName) {
    const config = loadConfig();
    return config.providers ? config.providers[providerName] : null;
}

/**
 * Sets the configuration object for a specific provider and saves the config.
 * @param {string} providerName The name of the provider.
 * @param {Object} providerConfig The configuration object for the provider.
 */
function setProviderConfig(providerName, providerConfig) {
    const config = loadConfig();
    if (!config.providers) {
        config.providers = {};
    }
    config.providers[providerName] = providerConfig;
    saveConfig(config);
    console.log(`Configuration for provider "${providerName}" saved.`);
}

export {
    saveConfig,
    loadConfig,
    getSelectedProviderName,
    setSelectedProviderName,
    getProviderConfig,
    setProviderConfig
};