import { saveLilacToDB, updateLilacInDB } from './database.js';
import { renderLilacsOnMap, getLilacs, setLilacs, currentMarkerLocation, map } from './map.js';
import { processCsvImport, exportLilacsToCsv } from './csv.js';

// Get modal elements
const lilacModal = document.getElementById('lilac-modal');
const importModal = document.getElementById('import-modal');
const closeModalButtons = document.querySelectorAll('.modal .close');
const lilacForm = document.getElementById('lilac-form');
const modalTitle = document.getElementById('modal-title');
const lilacIdInput = document.getElementById('lilac-id');
const lilacColorInput = document.getElementById('lilac-color');
const lilacTimingInput = document.getElementById('lilac-timing');
const lilacNoteInput = document.getElementById('lilac-note');

// Get buttons
const addLilacBtn = document.getElementById('add-lilac-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const processImportBtn = document.getElementById('process-import-btn');
const csvFileInput = document.getElementById('csv-file');

// Function to open the lilac modal
function openLilacModal(title, lilac = null, location = null) {
    modalTitle.textContent = title;
    lilacIdInput.value = lilac ? lilac.id : '';
    lilacColorInput.value = lilac ? lilac.color : 'white';
    if (lilac) {
        lilacTimingInput.value = lilac.timing;
    } else {
        lilacTimingInput.value = 'early'; // Set a default value for new lilacs
    }
    lilacNoteInput.value = lilac ? lilac.note : '';
    lilacModal.style.display = 'block';
    if (location) {
        currentMarkerLocation = location;
    }
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
    openLilacModal('Add Lilac', null, center); // Pass center to openLilacModal
});

// Handle Import CSV button click
importCsvBtn.addEventListener('click', function() {
    importModal.style.display = 'block';
});

// Handle Export CSV button click
exportCsvBtn.addEventListener('click', function() {
    exportLilacsToCsv();
});

// Handle CSV file selection and import
processImportBtn.addEventListener('click', function() {
    const file = csvFileInput.files[0];
    processCsvImport(file);
});


// Handle lilac form submission
lilacForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = lilacIdInput.value ? parseInt(lilacIdInput.value) : null;
    const color = lilacColorInput.value;
    const timing = lilacTimingInput.value;
    const note = lilacNoteInput.value;

    let latitude, longitude;

    if (id) {
        // Editing existing lilac
        const existingLilac = getLilacs().find(lilac => lilac.id === id);
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
        const lilacs = getLilacs();
        const index = lilacs.findIndex(l => l.id === id);
        if (index !== -1) {
            lilacs[index] = lilac;
            setLilacs(lilacs);
            await updateLilacInDB(lilac);
        }
    } else {
        // Add new lilac to array and DB
        const savedLilac = await saveLilacToDB(lilac);
        const lilacs = getLilacs();
        lilacs.push(savedLilac);
        setLilacs(lilacs);
    }

    renderLilacsOnMap();
    closeModals();
    lilacForm.reset();
    // currentMarkerLocation = null; // Reset location - handled by map click
});

export { openLilacModal, closeModals, importModal, lilacModal };