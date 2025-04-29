import { getProviderConfig } from '../utils/configStorage.js';

// JSONBin.io Data Storage Provider

let refreshIntervalId = null;
let onDataRefreshedCallback = null;

// Helper function to get the JSONBin.io ID and auto-refresh config from configuration
function getJsonBinConfig() {
    const config = getProviderConfig('jsonBin');
    const defaultRefreshInterval = 10; // Default to 10 seconds
    return config ? {
        binId: config.binId,
        masterKey: config.masterKey,
        autoRefreshEnabled: config.autoRefreshEnabled || false,
        refreshIntervalSeconds: config.refreshIntervalSeconds >= 5 ? config.refreshIntervalSeconds : defaultRefreshInterval // Ensure minimum 5 seconds
    } : { binId: null, masterKey: null, autoRefreshEnabled: false, refreshIntervalSeconds: defaultRefreshInterval };
}

// Helper function to fetch data from JSONBin.io
async function fetchDataFromJSONBin() {
    const { binId, masterKey } = getJsonBinConfig();
    if (!binId) {
        console.error("JSONBin.io ID is not configured.");
        return [];
    }
    const jsonBinApiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

    const headers = {
        'Content-Type': 'application/json'
    };
    if (masterKey) {
        headers['X-Master-Key'] = masterKey;
    }

    try {
        const response = await fetch(jsonBinApiUrl, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // JSONBin.io wraps the data in a 'record' key for v3
        // The actual data is expected to be in a 'things' property within 'record'
        if (data.record && Array.isArray(data.record.things)) {
            const things = data.record.things;
            console.log("Things fetched from JSONBin.io:", things);
            if (onDataRefreshedCallback) {
                onDataRefreshedCallback(things);
            }
            return things;
        } else if (data.record) {
            console.warn("JSONBin.io data.record does not contain an array in 'things' property:", data.record);
            if (onDataRefreshedCallback) {
                 onDataRefreshedCallback([]); // Call callback with empty array on warning
            }
            return [];
        } else {
             if (onDataRefreshedCallback) {
                 onDataRefreshedCallback([]); // Call callback with empty array on no record
            }
            return [];
        }
    } catch (error) {
        console.error("Error fetching data from JSONBin.io:", error);
        if (onDataRefreshedCallback) {
             onDataRefreshedCallback([]); // Call callback with empty array on error
        }
        return []; // Return empty array on error
    }
}

// Helper function to update the entire data on JSONBin.io
async function updateDataOnJSONBin(data) {
    const { binId, masterKey } = getJsonBinConfig();
    if (!binId || binId === 'YOUR_JSONBIN_ID') {
        console.error("JSONBin.io ID is not configured. Cannot save data.");
        return;
    }
    const jsonBinApiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

    const headers = {
        'Content-Type': 'application/json'
    };
    if (masterKey) {
        headers['X-Master-Key'] = masterKey;
    }

    try {
        const response = await fetch(jsonBinApiUrl, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Data successfully updated on JSONBin.io");
    } catch (error) {
        console.error("Error updating data on JSONBin.io:", error);
        throw error; // Re-throw to allow calling functions to handle
    }
}

/**
 * Starts the automatic data refresh from JSONBin.io based on configuration.
 * @param {function} callback A function to call with the fetched data after each successful refresh.
 */
function startAutoRefresh(callback) {
    stopAutoRefresh(); // Clear any existing interval
    onDataRefreshedCallback = callback;

    const config = getJsonBinConfig();
    if (config.autoRefreshEnabled && config.binId) {
        const intervalMilliseconds = config.refreshIntervalSeconds * 1000;
        refreshIntervalId = setInterval(async () => {
            console.log("Attempting auto-refresh from JSONBin.io...");
            await fetchDataFromJSONBin(); // fetchDataFromJSONBin calls the callback on success
        }, intervalMilliseconds);
        console.log(`JSONBin.io auto-refresh started with interval: ${config.refreshIntervalSeconds} seconds.`);
    } else {
        console.log("JSONBin.io auto-refresh is disabled or Bin ID is not configured.");
    }
}

/**
 * Stops the automatic data refresh from JSONBin.io.
 */
function stopAutoRefresh() {
    if (refreshIntervalId !== null) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
        onDataRefreshedCallback = null;
        console.log("JSONBin.io auto-refresh stopped.");
    }
}


/**
 * Asynchronously loads all "things" from JSONBin.io.
 * Implements the loadThings interface function.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of thing objects.
 */
async function loadThings() {
    console.log("Loading things from JSONBin.io...");
    // Note: loadThings itself doesn't trigger the auto-refresh callback,
    // the callback is triggered by the interval in startAutoRefresh.
    // The initial load when the provider is selected should be handled separately.
    return await fetchDataFromJSONBin();
}

/**
 * Asynchronously saves a single "thing" to JSONBin.io.
 * Implements the saveThing interface function.
 * If the thing has an ID, it should be updated. If not, it should be added.
 * @param {Object} thing The thing object to save.
 * @returns {Promise<Object>} A promise that resolves with the saved thing object (including its ID if newly added).
 */
async function saveThing(thing) {
    console.log("Saving thing to JSONBin.io:", thing);
    const currentData = await fetchDataFromJSONBin();
    // Ensure currentData is an array before pushing
    const things = Array.isArray(currentData) ? currentData : [];
    // Assign a simple unique ID for new items (timestamp + random)
    if (!thing.id) {
        thing.id = Date.now().toString();
    }
    things.push(thing);
    // Wrap the array in the expected JSONBin.io structure
    await updateDataOnJSONBin({ things: things });
    console.log("Thing saved:", thing);
    return thing;
}

/**
 * Asynchronously updates an existing "thing" in JSONBin.io.
 * Implements the updateThing interface function.
 * @param {Object} thing The thing object to update. Must have an ID.
 * @returns {Promise<Object>} A promise that resolves with the updated thing object.
 */
async function updateThing(thing) {
    console.log("Updating thing in JSONBin.io:", thing);
    let currentData = await fetchDataFromJSONBin();
    // Ensure currentData is an array before finding index
    let things = Array.isArray(currentData) ? currentData : [];
    const index = things.findIndex(t => t.id === thing.id);
    if (index !== -1) {
        things[index] = thing;
        // Wrap the array in the expected JSONBin.io structure
        await updateDataOnJSONBin({ things: things });
        console.log("Thing updated:", thing);
        return thing;
    } else {
        console.error("Thing not found for update:", thing);
        throw new Error("Thing not found for update");
    }
}

/**
 * Asynchronously deletes a "thing" from JSONBin.io by its ID.
 * Implements the deleteThing interface function.
 * @param {string|number} thingId The ID of the thing to delete.
 * @returns {Promise<void>} A promise that resolves when the thing is deleted.
 */
async function deleteThing(thingId) {
    console.log("Deleting thing from JSONBin.io with ID:", thingId);
    let currentData = await fetchDataFromJSONBin();
    // Ensure currentData is an array before filtering
    let things = Array.isArray(currentData) ? currentData : [];
    const initialLength = things.length;
    things = things.filter(thing => thing.id !== thingId);
    if (things.length < initialLength) {
        // Wrap the array in the expected JSONBin.io structure
        await updateDataOnJSONBin({ things: things });
        console.log("Thing deleted with ID:", thingId);
    } else {
        console.warn("Thing not found for deletion with ID:", thingId);
    }
}

/**
 * Asynchronously removes all "things" from JSONBin.io.
 * Implements the clearThings interface function.
 * @returns {Promise<void>} A promise that resolves when all things are cleared.
 */
async function clearThings() {
    console.log("Clearing all things from JSONBin.io...");
    // Wrap the empty array in the expected JSONBin.io structure
    await updateDataOnJSONBin({ things: [] });
    console.log("All things cleared.");
}

export {
    loadThings,
    saveThing,
    updateThing,
    deleteThing,
    clearThings,
    startAutoRefresh,
    stopAutoRefresh
};