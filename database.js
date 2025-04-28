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


// Function to load things from IndexedDB
function loadThingsFromDB() {
    return dbReadyPromise.then(() => { // Wait for the DB to be ready
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['things'], 'readonly');
            const objectStore = transaction.objectStore('things');
            const request = objectStore.getAll();

            request.onsuccess = function(event) {
                const things = event.target.result;
                // console.log("Things loaded from DB:", things);
                resolve(things);
            };

            request.onerror = function(event) {
                console.error("Error loading things from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to save a thing to IndexedDB
function saveThingToDB(thing) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['things'], 'readwrite');
            const objectStore = transaction.objectStore('things');
            const request = objectStore.add(thing);

            request.onsuccess = function(event) {
                console.log("Thing saved to DB:", thing);
                thing.id = event.target.result; // Update thing object with the generated ID
                resolve(thing);
            };

            request.onerror = function(event) {
                console.error("Error saving thing to DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to update a thing in IndexedDB
function updateThingInDB(thing) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['things'], 'readwrite');
            const objectStore = transaction.objectStore('things');
            const request = objectStore.put(thing);

            request.onsuccess = function(event) {
                console.log("Thing updated in DB:", thing);
                resolve(thing);
            };

            request.onerror = function(event) {
                console.error("Error updating thing in DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to delete a thing from IndexedDB
function deleteThingFromDB(thingId) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['things'], 'readwrite');
            const objectStore = transaction.objectStore('things');
            const request = objectStore.delete(thingId);

            request.onsuccess = function(event) {
                console.log("Thing deleted from DB with ID:", thingId);
                resolve();
            };

            request.onerror = function(event) {
                console.error("Error deleting thing from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to clear all things from IndexedDB
function clearAllThingsFromDB() {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['things'], 'readwrite');
            const objectStore = db.transaction(['things'], 'readwrite').objectStore('things');
            const request = objectStore.clear();

            request.onsuccess = function() {
                console.log("All things cleared from DB.");
                resolve();
            };

            request.onerror = function(event) {
                console.error("Error clearing things from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

export { loadThingsFromDB, saveThingToDB, updateThingInDB, deleteThingFromDB, clearAllThingsFromDB };