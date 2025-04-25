import { saveLilacToDB, updateLilacInDB } from './database.js';
import { renderLilacsOnMap, getLilacs, setLilacs, currentMarkerLocation } from './map.js';

// Get modal elements
const lilacModal = document.getElementById('lilac-modal');
const importModal = document.getElementById('import-modal');
const closeModalButtons = document.querySelectorAll('.modal .close');
const lilacForm = document.getElementById('lilac-form');
const modalTitle = document.getElementById('modal-title');
const lilacIdInput = document.getElementById('lilac-id');
const lilacColorInput = document.getElementById('lilac-color');
const timingEarlyInput = document.getElementById('timing-early');
const timingLateInput = document.getElementById('timing-late');
const lilacNoteInput = document.getElementById('lilac-note');

// Get buttons
const addLilacBtn = document.getElementById('add-lilac-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const processImportBtn = document.getElementById('process-import-btn');
const csvFileInput = document.getElementById('csv-file');

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
    const center = map.getCenter(); // map is imported from map.js
    currentMarkerLocation = center; // currentMarkerLocation is imported from map.js
    openLilacModal('Add Lilac');
});

// Handle Import CSV button click
importCsvBtn.addEventListener('click', function() {
    importModal.style.display = 'block';
});

// Handle Export CSV button click
exportCsvBtn.addEventListener('click', function() {
    exportLilacsToCsv(); // exportLilacsToCsv is in csv.js
});


// Handle lilac form submission
lilacForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = lilacIdInput.value ? parseInt(lilacIdInput.value) : null;
    const color = lilacColorInput.value;
    const timing = document.querySelector('input[name="lilac-timing"]:checked').value;
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

export { openLilacModal, closeModals, importModal, processImportBtn, importCsvBtn, addLilacBtn, closeModalButtons, exportCsvBtn, lilacModal, csvFileInput };