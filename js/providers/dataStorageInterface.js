/**
 * Defines the standard interface for data storage providers.
 * All provider modules should implement these functions.
 */

/**
 * Asynchronously loads all "things" from the storage.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of thing objects.
 */
async function loadThings() {
    throw new Error("loadThings not implemented by provider.");
}

/**
 * Asynchronously saves a single "thing" to the storage.
 * If the thing has an ID, it should be updated. If not, it should be added.
 * @param {Object} thing The thing object to save.
 * @returns {Promise<Object>} A promise that resolves with the saved thing object (including its ID if newly added).
 */
async function saveThing(thing) {
    throw new Error("saveThing not implemented by provider.");
}

/**
 * Asynchronously updates an existing "thing" in the storage.
 * @param {Object} thing The thing object to update. Must have an ID.
 * @returns {Promise<Object>} A promise that resolves with the updated thing object.
 */
async function updateThing(thing) {
    throw new Error("updateThing not implemented by provider.");
}

/**
 * Asynchronously deletes a "thing" from the storage by its ID.
 * @param {string|number} thingId The ID of the thing to delete.
 * @returns {Promise<void>} A promise that resolves when the thing is deleted.
 */
async function deleteThing(thingId) {
    throw new Error("deleteThing not implemented by provider.");
}

/**
 * Asynchronously removes all "things" from the storage.
 * @returns {Promise<void>} A promise that resolves when all things are cleared.
 */
async function clearThings() {
    throw new Error("clearThings not implemented by provider.");
}

export {
    loadThings,
    saveThing,
    updateThing,
    deleteThing,
    clearThings
};