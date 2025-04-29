import { getProviderConfig } from './configStorage.js';

// JSONBin.io Data Storage Provider

// Helper function to get the JSONBin.io ID from configuration
function getJsonBinIdFromConfig() {
    const config = getProviderConfig('jsonBin');
    return config ? { binId: config.binId, masterKey: config.masterKey } : { binId: null, masterKey: null };
}

// Helper function to fetch data from JSONBin.io
async function fetchDataFromJSONBin() {
    const { binId, masterKey } = getJsonBinIdFromConfig();
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
            return data.record.things;
        } else if (data.record) {
            console.warn("JSONBin.io data.record does not contain an array in 'things' property:", data.record);
            return [];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data from JSONBin.io:", error);
        return []; // Return empty array on error
    }
}

// Helper function to update the entire data on JSONBin.io
async function updateDataOnJSONBin(data) {
    const { binId, masterKey } = getJsonBinIdFromConfig();
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
 * Asynchronously loads all "things" from JSONBin.io.
 * Implements the loadThings interface function.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of thing objects.
 */
async function loadThings() {
    console.log("Loading things from JSONBin.io...");
    const things = await fetchDataFromJSONBin();
    console.log("Things loaded:", things);
    return things;
}

/**
 * Asynchronously saves a single "thing" to JSONBin.io.
 * Implements the saveThing interface function.
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
        thing.id = Date.now() + Math.random().toString(36).substring(2, 15);
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
    clearThings
};