// Data Storage Manager

import { getSelectedProviderName, getProviderConfig } from './configStorage.js';
import * as indexedDBProvider from '../providers/indexedDBProvider.js';
import * as jsonBinProvider from '../providers/jsonBinProvider.js';
// Import other provider modules here

let activeProvider = null;

// Map provider names to their modules
const providers = {
    indexedDB: indexedDBProvider,
    jsonBin: jsonBinProvider
    // Add other providers here
};

/**
 * Initializes the data storage manager by selecting the active provider
 * based on the saved configuration.
 */
function initializeStorage() {
    const selectedProviderName = getSelectedProviderName() || 'indexedDB'; // Default to indexedDB
    setActiveProvider(selectedProviderName);
}

/**
 * Sets the active data storage provider.
 * @param {string} providerName The name of the provider to set as active.
 */
function setActiveProvider(providerName) {
    const provider = providers[providerName];
    if (provider) {
        activeProvider = provider;
        console.log(`Active data storage provider set to: ${providerName}`);
        // TODO: Potentially initialize the provider if needed (e.g., open DB connection)
        // This might be handled within the provider's load function or a dedicated init function.
    } else {
        console.error(`Provider "${providerName}" not found. Falling back to IndexedDB.`);
        activeProvider = indexedDBProvider; // Fallback to IndexedDB
        // TODO: Update config to reflect fallback?
    }
}

// Expose the data storage interface functions, delegating to the active provider

/**
 * Asynchronously loads all "things" from the active storage provider.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of thing objects.
 */
async function loadThings() {
    if (!activeProvider || !activeProvider.loadThings) {
        console.error("No active provider or loadThings function not available.");
        return [];
    }
    return activeProvider.loadThings();
}

/**
 * Asynchronously saves a single "thing" using the active storage provider.
 * @param {Object} thing The thing object to save.
 * @returns {Promise<Object>} A promise that resolves with the saved thing object.
 */
async function saveThing(thing) {
    if (!activeProvider || !activeProvider.saveThing) {
        console.error("No active provider or saveThing function not available.");
        throw new Error("Save operation failed: Provider not ready.");
    }
    return activeProvider.saveThing(thing);
}

/**
 * Asynchronously updates an existing "thing" using the active storage provider.
 * @param {Object} thing The thing object to update.
 * @returns {Promise<Object>} A promise that resolves with the updated thing object.
 */
async function updateThing(thing) {
    if (!activeProvider || !activeProvider.updateThing) {
        console.error("No active provider or updateThing function not available.");
        throw new Error("Update operation failed: Provider not ready.");
    }
    return activeProvider.updateThing(thing);
}

/**
 * Asynchronously deletes a "thing" using the active storage provider.
 * @param {string|number} thingId The ID of the thing to delete.
 * @returns {Promise<void>} A promise that resolves when the thing is deleted.
 */
async function deleteThing(thingId) {
    if (!activeProvider || !activeProvider.deleteThing) {
        console.error("No active provider or deleteThing function not available.");
        throw new Error("Delete operation failed: Provider not ready.");
    }
    return activeProvider.deleteThing(thingId);
}

/**
 * Asynchronously removes all "things" using the active storage provider.
 * @returns {Promise<void>} A promise that resolves when all things are cleared.
 */
async function clearThings() {
    if (!activeProvider || !activeProvider.clearThings) {
        console.error("No active provider or clearThings function not available.");
        throw new Error("Clear operation failed: Provider not ready.");
    }
    return activeProvider.clearThings();
}

// Initialize the storage manager when the module is loaded
initializeStorage();

// Export the interface functions
export {
    loadThings,
    saveThing,
    updateThing,
    deleteThing,
    clearThings,
    setActiveProvider // Export setActiveProvider to allow config modal to change provider
};