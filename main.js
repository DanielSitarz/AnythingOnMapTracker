import { loadLilacsFromDB } from './database.js';
import { renderLilacsOnMap, setLilacs, map } from './map.js'; // Import map as well for button handlers
import { processCsvImport, exportLilacsToCsv } from './csv.js';
import { importModal, processImportBtn, csvFileInput, importCsvBtn, exportCsvBtn, addLilacBtn, openLilacModal, closeModals, closeModalButtons, lilacModal } from './modals.js'; // Import necessary elements and functions from modals

// Handle Add Lilac button click (moved from modals.js to use the map object)
addLilacBtn.addEventListener('click', function() {
    // Get current map center for adding via button
    const center = map.getCenter();
    // currentMarkerLocation is managed within map.js now, openLilacModal will handle setting it
    openLilacModal('Add Lilac', null, center); // Pass center to openLilacModal
});

// Handle Import CSV button click (moved from modals.js)
importCsvBtn.addEventListener('click', function() {
    importModal.style.display = 'block';
});

// Handle Export CSV button click (moved from modals.js)
exportCsvBtn.addEventListener('click', function() {
    exportLilacsToCsv();
});

// Handle CSV file selection and import (moved from csv.js to use modal elements)
processImportBtn.addEventListener('click', function() {
    const file = csvFileInput.files[0];
    processCsvImport(file); // Call the function from csv.js
});

// Close modals when clicking on the close button (x) (moved from modals.js)
closeModalButtons.forEach(button => {
    button.addEventListener('click', closeModals);
});

// Close modals when clicking outside of the modal content (moved from modals.js)
window.addEventListener('click', function(event) {
    if (event.target === lilacModal || event.target === importModal) {
        closeModals();
    }
});


// Initial load of lilacs from DB and render on map
loadLilacsFromDB().then(lilacs => {
    setLilacs(lilacs);
    renderLilacsOnMap();
}).catch(error => {
    console.error("Failed to load lilacs on startup:", error);
});