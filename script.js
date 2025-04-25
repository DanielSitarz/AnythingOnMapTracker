// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Store lilac data
let lilacs = [];

// Initialize IndexedDB
const dbName = 'lilacTrackerDB';
const dbVersion = 1;
let db;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = function(event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB opened successfully");
    loadLilacsFromDB(); // Load existing lilacs on startup
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('lilacs', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('location', ['latitude', 'longitude'], { unique: false });
};

// Function to load lilacs from IndexedDB
function loadLilacsFromDB() {
    if (!db) {
        console.error("IndexedDB not initialized.");
        return;
    }
    const transaction = db.transaction(['lilacs'], 'readonly');
    const objectStore = transaction.objectStore('lilacs');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        lilacs = event.target.result;
        console.log("Lilacs loaded from DB:", lilacs);
        renderLilacsOnMap(); // Render loaded lilacs on the map
    };

    request.onerror = function(event) {
        console.error("Error loading lilacs from DB:", event.target.errorCode);
    };
}

// Function to save a lilac to IndexedDB
function saveLilacToDB(lilac) {
    if (!db) {
        console.error("IndexedDB not initialized.");
        return;
    }
    const transaction = db.transaction(['lilacs'], 'readwrite');
    const objectStore = transaction.objectStore('lilacs');
    const request = objectStore.add(lilac);

    request.onsuccess = function(event) {
        console.log("Lilac saved to DB:", lilac);
        lilac.id = event.target.result; // Update lilac object with the generated ID
    };

    request.onerror = function(event) {
        console.error("Error saving lilac to DB:", event.target.errorCode);
    };
}

// Function to update a lilac in IndexedDB
function updateLilacInDB(lilac) {
    if (!db) {
        console.error("IndexedDB not initialized.");
        return;
    }
    const transaction = db.transaction(['lilacs'], 'readwrite');
    const objectStore = transaction.objectStore('lilacs');
    const request = objectStore.put(lilac);

    request.onsuccess = function(event) {
        console.log("Lilac updated in DB:", lilac);
    };

    request.onerror = function(event) {
        console.error("Error updating lilac in DB:", event.target.errorCode);
    };
}

// Function to delete a lilac from IndexedDB
function deleteLilacFromDB(lilacId) {
    if (!db) {
        console.error("IndexedDB not initialized.");
        return;
    }
    const transaction = db.transaction(['lilacs'], 'readwrite');
    const objectStore = transaction.objectStore('lilacs');
    const request = objectStore.delete(lilacId);

    request.onsuccess = function(event) {
        console.log("Lilac deleted from DB with ID:", lilacId);
    };

    request.onerror = function(event) {
        console.error("Error deleting lilac from DB:", event.target.errorCode);
    };
}


// Function to render lilacs on the map
function renderLilacsOnMap() {
    // Clear existing markers (if any)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    lilacs.forEach(lilac => {
        const marker = L.marker([lilac.latitude, lilac.longitude]).addTo(map);
        marker.bindPopup(`
            <b>Color:</b> ${lilac.color}<br>
            <b>Timing:</b> ${lilac.timing}<br>
            ${lilac.note ? `<b>Note:</b> ${lilac.note}<br>` : ''}
            <button class="edit-lilac" data-id="${lilac.id}">Edit</button>
            <button class="delete-lilac" data-id="${lilac.id}">Delete</button>
        `);
         marker.on('popupopen', function() {
            document.querySelector(`.edit-lilac[data-id="${lilac.id}"]`).addEventListener('click', handleEditLilac);
            document.querySelector(`.delete-lilac[data-id="${lilac.id}"]`).addEventListener('click', handleDeleteLilac);
        });
    });
}

// Handle map click to add a lilac
map.on('click', function(e) {
    // For now, just log the coordinates. We'll add the form later.
    console.log("Map clicked at:", e.latlng);
    // We'll trigger the add lilac modal here later
});

// Function to handle adding a new lilac (will be triggered by button or map click)
function addLilac(latitude, longitude) {
    // This function will open a modal/form for data entry
    console.log("Add lilac at:", latitude, longitude);
    // TODO: Implement modal for data entry
}

// Function to handle editing a lilac
function handleEditLilac(event) {
    const lilacId = parseInt(event.target.dataset.id);
    const lilacToEdit = lilacs.find(lilac => lilac.id === lilacId);
    if (lilacToEdit) {
        console.log("Editing lilac:", lilacToEdit);
        // TODO: Implement modal for editing
    }
}

// Function to handle deleting a lilac
function handleDeleteLilac(event) {
    const lilacId = parseInt(event.target.dataset.id);
    console.log("Deleting lilac with ID:", lilacId);
    // Remove from array
    lilacs = lilacs.filter(lilac => lilac.id !== lilacId);
    // Remove from DB
    deleteLilacFromDB(lilacId);
    // Re-render map
    renderLilacsOnMap();
}

// Get modal elements
const lilacModal = document.getElementById('lilac-modal');
const importModal = document.getElementById('import-modal');
const closeModalButtons = document.querySelectorAll('.modal .close');
const lilacForm = document.getElementById('lilac-form');
const modalTitle = document.getElementById('modal-title');
const lilacIdInput = document.getElementById('lilac-id');
const lilacColorInput = document.getElementById('lilac-color');
const timingEarlyInput = document.getElementById('timing-early');
const timingLateInput = document.getElementById('timing-late'); // Corrected ID
const lilacNoteInput = document.getElementById('lilac-note');

// Get buttons
const addLilacBtn = document.getElementById('add-lilac-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const processImportBtn = document.getElementById('process-import-btn');
const csvFileInput = document.getElementById('csv-file');

let currentMarkerLocation = null; // To store location when adding from button

// Function to open the lilac modal
function openLilacModal(title, lilac = null) {
    modalTitle.textContent = title;
    lilacIdInput.value = lilac ? lilac.id : '';
    lilacColorInput.value = lilac ? lilac.color : 'white';
    if (lilac) {
        if (lilac.timing === 'early') {
            timingEarlyInput.checked = true;
        } else {
            timingLateInput.checked = true;
        }
    } else {
        timingEarlyInput.checked = false;
        timingLateInput.checked = false;
    }
    lilacNoteInput.value = lilac ? lilac.note : '';
    lilacModal.style.display = 'block';
}

// Function to close modals
function closeModals() {
    lilacModal.style.display = 'none';
    importModal.style.display = 'none';
}

// Close modals when clicking on the close button (x)
closeModalButtons.forEach(button => {
    button.addEventListener('click', closeModals);
});

// Close modals when clicking outside of the modal content
window.addEventListener('click', function(event) {
    if (event.target === lilacModal || event.target === importModal) {
        closeModals();
    }
});

// Handle Add Lilac button click
addLilacBtn.addEventListener('click', function() {
    // Get current map center for adding via button
    const center = map.getCenter();
    currentMarkerLocation = center;
    openLilacModal('Add Lilac');
});

// Handle Import CSV button click
importCsvBtn.addEventListener('click', function() {
    importModal.style.display = 'block';
});

// Handle Export CSV button click
exportCsvBtn.addEventListener('click', function() {
    exportLilacsToCsv();
});


// Handle lilac form submission
lilacForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const id = lilacIdInput.value ? parseInt(lilacIdInput.value) : null;
    const color = lilacColorInput.value;
    const timing = document.querySelector('input[name="lilac-timing"]:checked').value;
    const note = lilacNoteInput.value;

    let latitude, longitude;

    if (id) {
        // Editing existing lilac
        const existingLilac = lilacs.find(lilac => lilac.id === id);
        latitude = existingLilac.latitude;
        longitude = existingLilac.longitude;
    } else {
        // Adding new lilac
        if (currentMarkerLocation) {
            latitude = currentMarkerLocation.lat;
            longitude = currentMarkerLocation.lng;
        } else {
            // This case should ideally not happen if triggered by map click
            console.error("No location available for new lilac.");
            return;
        }
    }


    const lilac = {
        latitude: latitude,
        longitude: longitude,
        color: color,
        timing: timing,
        note: note
    };

    // Only include id if it exists (for updates)
    if (id) {
        lilac.id = id;
    }

    if (id) {
        // Update existing lilac in array and DB
        const index = lilacs.findIndex(l => l.id === id);
        if (index !== -1) {
            lilacs[index] = lilac;
            updateLilacInDB(lilac);
        }
    } else {
        // Add new lilac to array and DB
        lilacs.push(lilac);
        saveLilacToDB(lilac);
    }

    renderLilacsOnMap();
    closeModals();
    lilacForm.reset();
    currentMarkerLocation = null; // Reset location
});


// Update map click handler to open modal
map.on('click', function(e) {
    currentMarkerLocation = e.latlng;
    openLilacModal('Add Lilac');
});

// Update handleEditLilac to open modal with data
function handleEditLilac(event) {
    const lilacId = parseInt(event.target.dataset.id);
    const lilacToEdit = lilacs.find(lilac => lilac.id === lilacId);
    if (lilacToEdit) {
        currentMarkerLocation = { lat: lilacToEdit.latitude, lng: lilacToEdit.longitude }; // Store location for potential update
        openLilacModal('Edit Lilac', lilacToEdit);
    }
}

// Geolocation
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    const radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters of this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);


// Function to export lilacs to CSV
function exportLilacsToCsv() {
    const csvData = lilacs.map(lilac => ({
        latitude: lilac.latitude,
        longitude: lilac.longitude,
        color: lilac.color,
        timing: lilac.timing,
        note: lilac.note || '' // Ensure note is not undefined
    }));

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lilac_tracker_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Handle CSV file selection and import
processImportBtn.addEventListener('click', function() {
    const file = csvFileInput.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                const importedLilacs = results.data.map(item => ({
                    // Assuming CSV headers match these keys
                    latitude: parseFloat(item.latitude),
                    longitude: parseFloat(item.longitude),
                    color: item.color,
                    timing: item.timing,
                    note: item.note || ''
                })).filter(lilac => !isNaN(lilac.latitude) && !isNaN(lilac.longitude)); // Filter out invalid entries

                const importOption = document.querySelector('input[name="import-option"]:checked').value;

                if (importOption === 'overwrite') {
                    lilacs = importedLilacs;
                    // Clear existing data in DB and save new data
                    clearAllLilacsFromDB().then(() => {
                        importedLilacs.forEach(saveLilacToDB);
                        renderLilacsOnMap();
                        closeModals();
                    });
                } else if (importOption === 'merge') {
                    // Simple merge: add imported lilacs to existing ones
                    // Note: This doesn't handle potential duplicates based on location/properties
                    importedLilacs.forEach(lilac => {
                        lilacs.push(lilac);
                        saveLilacToDB(lilac);
                    });
                    renderLilacsOnMap();
                    closeModals();
                }
            }
        });
    } else {
        alert("Please select a CSV file to import.");
    }
});

// Function to clear all lilacs from IndexedDB
function clearAllLilacsFromDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error("IndexedDB not initialized.");
            reject("IndexedDB not initialized.");
            return;
        }
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
}