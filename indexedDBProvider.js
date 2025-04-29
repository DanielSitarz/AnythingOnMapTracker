// IndexedDB Data Storage Provider

// Initialize IndexedDB
const dbName = 'thingTrackerDB';
const dbVersion = 1; // Increment version if changing object store structure
let db;

// Create a promise for DB readiness
const dbReadyPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode); // Reject the promise on error
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("IndexedDB opened successfully");
        resolve(db); // Resolve the promise with the db instance
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        // Check if the 'things' object store already exists before creating
        if (!db.objectStoreNames.contains('things')) {
            const objectStore = db.createObjectStore('things', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('location', ['latitude', 'longitude'], { unique: false });
            objectStore.createIndex('type', 'type', { unique: false }); // Add index for type
        }
        // If upgrading from a previous version (e.g., v1 with 'lilacs'), handle migration here if necessary
        // For this change, we are effectively starting fresh with a new DB name, so no migration needed from 'lilacTrackerDB'
    };
});


/**
 * Asynchronously loads all "things" from IndexedDB.
 * Implements the loadThings interface function.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of thing objects.
 */
async function loadThings() {
    await dbReadyPromise; // Wait for the DB to be ready
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['things'], 'readonly');
        const objectStore = transaction.objectStore('things');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const things = event.target.result;
            console.log("Things loaded from IndexedDB:", things);
            resolve(things);
        };

        request.onerror = function(event) {
            console.error("Error loading things from IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

/**
 * Asynchronously saves a single "thing" to IndexedDB.
 * Implements the saveThing interface function.
 * @param {Object} thing The thing object to save.
 * @returns {Promise<Object>} A promise that resolves with the saved thing object (including its ID if newly added).
 */
async function saveThing(thing) {
    await dbReadyPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['things'], 'readwrite');
        const objectStore = transaction.objectStore('things');
        const request = objectStore.add(thing);

        request.onsuccess = function(event) {
            console.log("Thing saved to IndexedDB:", thing);
            thing.id = event.target.result; // Update thing object with the generated ID
            resolve(thing);
        };

        request.onerror = function(event) {
            console.error("Error saving thing to IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

/**
 * Asynchronously updates an existing "thing" in IndexedDB.
 * Implements the updateThing interface function.
 * @param {Object} thing The thing object to update. Must have an ID.
 * @returns {Promise<Object>} A promise that resolves with the updated thing object.
 */
async function updateThing(thing) {
    await dbReadyPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['things'], 'readwrite');
        const objectStore = transaction.objectStore('things');
        const request = objectStore.put(thing);

        request.onsuccess = function(event) {
            console.log("Thing updated in IndexedDB:", thing);
            resolve(thing);
        };

        request.onerror = function(event) {
            console.error("Error updating thing in IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

/**
 * Asynchronously deletes a "thing" from IndexedDB by its ID.
 * Implements the deleteThing interface function.
 * @param {string|number} thingId The ID of the thing to delete.
 * @returns {Promise<void>} A promise that resolves when the thing is deleted.
 */
async function deleteThing(thingId) {
    await dbReadyPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['things'], 'readwrite');
        const objectStore = transaction.objectStore('things');
        const request = objectStore.delete(thingId);

        request.onsuccess = function(event) {
            console.log("Thing deleted from IndexedDB with ID:", thingId);
            resolve();
        };

        request.onerror = function(event) {
            console.error("Error deleting thing from IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

/**
 * Asynchronously removes all "things" from IndexedDB.
 * Implements the clearThings interface function.
 * @returns {Promise<void>} A promise that resolves when all things are cleared.
 */
async function clearThings() {
    await dbReadyPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['things'], 'readwrite');
        const objectStore = db.transaction(['things'], 'readwrite').objectStore('things');
        const request = objectStore.clear();

        request.onsuccess = function() {
            console.log("All things cleared from IndexedDB.");
            resolve();
        };

        request.onerror = function(event) {
            console.error("Error clearing things from IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

export {
    loadThings,
    saveThing,
    updateThing,
    deleteThing,
    clearThings
};