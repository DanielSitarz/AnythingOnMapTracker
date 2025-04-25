// Initialize IndexedDB
const dbName = 'lilacTrackerDB';
const dbVersion = 1;
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
        const objectStore = db.createObjectStore('lilacs', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('location', ['latitude', 'longitude'], { unique: false });
    };
});


// Function to load lilacs from IndexedDB
function loadLilacsFromDB() {
    return dbReadyPromise.then(() => { // Wait for the DB to be ready
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['lilacs'], 'readonly');
            const objectStore = transaction.objectStore('lilacs');
            const request = objectStore.getAll();

            request.onsuccess = function(event) {
                const lilacs = event.target.result;
                // console.log("Lilacs loaded from DB:", lilacs);
                resolve(lilacs);
            };

            request.onerror = function(event) {
                console.error("Error loading lilacs from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to save a lilac to IndexedDB
function saveLilacToDB(lilac) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['lilacs'], 'readwrite');
            const objectStore = transaction.objectStore('lilacs');
            const request = objectStore.add(lilac);

            request.onsuccess = function(event) {
                console.log("Lilac saved to DB:", lilac);
                lilac.id = event.target.result; // Update lilac object with the generated ID
                resolve(lilac);
            };

            request.onerror = function(event) {
                console.error("Error saving lilac to DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to update a lilac in IndexedDB
function updateLilacInDB(lilac) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['lilacs'], 'readwrite');
            const objectStore = transaction.objectStore('lilacs');
            const request = objectStore.put(lilac);

            request.onsuccess = function(event) {
                console.log("Lilac updated in DB:", lilac);
                resolve(lilac);
            };

            request.onerror = function(event) {
                console.error("Error updating lilac in DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to delete a lilac from IndexedDB
function deleteLilacFromDB(lilacId) {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['lilacs'], 'readwrite');
            const objectStore = transaction.objectStore('lilacs');
            const request = objectStore.delete(lilacId);

            request.onsuccess = function(event) {
                console.log("Lilac deleted from DB with ID:", lilacId);
                resolve();
            };

            request.onerror = function(event) {
                console.error("Error deleting lilac from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

// Function to clear all lilacs from IndexedDB
function clearAllLilacsFromDB() {
    return dbReadyPromise.then(() => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['lilacs'], 'readwrite');
            const objectStore = transaction.objectStore('lilacs');
            const request = objectStore.clear();

            request.onsuccess = function() {
                console.log("All lilacs cleared from DB.");
                resolve();
            };

            request.onerror = function(event) {
                console.error("Error clearing lilacs from DB:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    });
}

export { loadLilacsFromDB, saveLilacToDB, updateLilacInDB, deleteLilacFromDB, clearAllLilacsFromDB };