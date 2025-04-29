import { saveThing, updateThing } from '../utils/database.js';
import { renderThingsOnMap, getThings, setThings, map, setCurrentMarkerLocation, currentMarkerLocation } from '../map.js';
import { processCsvImport, exportThingsToCsv } from '../utils/csv.js';
import { getThingsConfig, getThingConfig, populateThingTypeSelect, populateFilterSidebar } from '../thingsConfig.js'; // Import new functions

// Get modal elements
const thingModal = document.getElementById('thing-modal');
const importModal = document.getElementById('import-modal');
const closeModalButtons = document.querySelectorAll('.modal .close');
const thingForm = document.getElementById('thing-form');
const modalTitle = document.getElementById('modal-title');
const thingIdInput = document.getElementById('thing-id');
const thingTypeSelect = document.getElementById('thing-type');
const thingDetailsContainer = document.getElementById('thing-details-container');
const thingModalContent = thingModal.querySelector('.modal-content');
const loadingSpinner = thingModal.querySelector('.loading-spinner');

// Get buttons and filter select
const addThingBtn = document.getElementById('add-thing-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const processImportBtn = document.getElementById('process-import-btn');
const csvFileInput = document.getElementById('csv-file');
const filterTypeSelect = document.getElementById('filter-type-list'); // Get the filter select element


// Render dynamic detail fields based on selected thing type
function renderDetailFields(thingType, thing = null) {
    thingDetailsContainer.innerHTML = ''; // Clear existing fields

    // Display creation date if editing/viewing
    if (thing && thing.id) {
        const creationDate = new Date(parseInt(thing.id)); // Assuming ID is a timestamp
        const formattedDate = creationDate.toLocaleString(); // User-friendly format
        const dateElement = document.createElement('p');
        dateElement.innerHTML = `<strong>Created:</strong> ${formattedDate}`;
        dateElement.style.marginBottom = '10px'; // Add some spacing
        thingDetailsContainer.appendChild(dateElement);
    }

    const thingConfig = getThingConfig(thingType);
    const currentDetails = thing ? thing.details : {};
    const currentColor = thing ? thing.color : '#808080'; // Get color from thing object

    if (thingConfig && thingConfig.details) {
        thingConfig.details.forEach(detail => {
            const label = document.createElement('label');
            label.textContent = `${detail.name}:`;
            thingDetailsContainer.appendChild(label);

            let inputElement;
            switch (detail.type) {
                case 'text':
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.value = currentDetails[detail.name] || '';
                    break;
                case 'number':
                    inputElement = document.createElement('input');
                    inputElement.type = 'number';
                    inputElement.value = currentDetails[detail.name] || '';
                    break;
                case 'select':
                    inputElement = document.createElement('select');
                    inputElement.classList.add('select-input'); // Add the class
                    detail.options.forEach(optionValue => {
                        const option = document.createElement('option');
                        option.value = optionValue;
                        option.textContent = optionValue;
                        if (currentDetails[detail.name] === optionValue) {
                            option.selected = true;
                        }
                        inputElement.appendChild(option);
                    });
                    break;
                default:
                    console.warn(`Unknown detail type: ${detail.type}`);
                    return;
            }
            inputElement.id = `detail-${detail.name.toLowerCase().replace(/\s/g, '-')}`; // Generate a unique ID
            inputElement.name = detail.name; // Use detail name as input name
            thingDetailsContainer.appendChild(inputElement);
            thingDetailsContainer.appendChild(document.createElement('br')); // Add a line break
        });
    }

    // Add a generic note field
    const noteLabel = document.createElement('label');
    noteLabel.textContent = 'Note:';
    thingDetailsContainer.appendChild(noteLabel);
    const noteInput = document.createElement('textarea');
    noteInput.id = 'thing-note';
    noteInput.name = 'note';
    noteInput.value = currentDetails.note || '';
    thingDetailsContainer.appendChild(noteInput);
    thingDetailsContainer.appendChild(document.createElement('br'));

    // Add color picker field
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Marker Color:';
    thingDetailsContainer.appendChild(colorLabel);
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'thing-color';
    colorInput.name = 'color';
    colorInput.value = currentColor; // Use the color from the thing object
    thingDetailsContainer.appendChild(colorInput);
    thingDetailsContainer.appendChild(document.createElement('br'));
}

// Event listener for thing type select change
thingTypeSelect.addEventListener('change', function() {
    renderDetailFields(this.value); // Pass the selected type to re-render details
});

// Event listener for filter type select change
filterTypeSelect.addEventListener('change', function() {
    renderThingsOnMap(this.value); // Pass the selected filter type to render function
});


// Function to open the thing modal
function openThingModal(title, thing = null, location = null) {
    modalTitle.textContent = title;
    thingIdInput.value = thing ? thing.id : '';

    if (thing) {
        thingTypeSelect.value = thing.type;
        renderDetailFields(thing.type, thing); // Pass the entire thing object
    } else {
        // For new things, select the first type and render its fields
        const firstThingType = getThingsConfig()[0]?.type;
        if (firstThingType) {
            thingTypeSelect.value = firstThingType;
            renderDetailFields(firstThingType);
        } else {
            console.error("No thing types configured.");
            // Optionally disable the form or show a message
        }
    }

    thingModal.style.display = 'block';
    if (location) {
        setCurrentMarkerLocation(location);
    }
}

// Function to close modals
function closeModals() {
    thingModal.style.display = 'none';
    importModal.style.display = 'none';
    thingForm.reset(); // Reset the form when closing
    thingDetailsContainer.innerHTML = ''; // Clear dynamic fields
    hideLoadingSpinner(); // Hide spinner when closing
}

// Close modals when clicking on the close button (x)
closeModalButtons.forEach(button => {
    button.addEventListener('click', closeModals);
});

// Close modals when clicking outside of the modal content
window.addEventListener('click', function(event) {
    if (event.target === thingModal || event.target === importModal) {
        closeModals();
    }
});

// Handle Add Thing button click
addThingBtn.addEventListener('click', function() {
    // Get current map center for adding via button
    const center = map.getCenter();
    openThingModal('Add Thing', null, center); // Pass center to openThingModal
});

// Handle Import CSV button click
importCsvBtn.addEventListener('click', function() {
    importModal.style.display = 'block';
});

// Handle Export CSV button click
exportCsvBtn.addEventListener('click', function() {
    exportThingsToCsv();
});

// Handle CSV file selection and import
processImportBtn.addEventListener('click', function() {
    const file = csvFileInput.files[0];
    processCsvImport(file);
});


// Show loading spinner
function showLoadingSpinner() {
    thingModalContent.classList.add('loading');
}

// Hide loading spinner
function hideLoadingSpinner() {
    thingModalContent.classList.remove('loading');
}

// Handle thing form submission
thingForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    showLoadingSpinner(); // Show spinner on submit

    const id = thingIdInput.value;
    const type = thingTypeSelect.value;
    const note = document.getElementById('thing-note').value; // Get the generic note field
    const color = document.getElementById('thing-color').value; // Get the color value

    const details = {};
    const thingConfig = getThingConfig(type);
    if (thingConfig && thingConfig.details) {
        thingConfig.details.forEach(detail => {
            const inputElement = document.getElementById(`detail-${detail.name.toLowerCase().replace(/\s/g, '-')}`);
            if (inputElement) {
                details[detail.name] = inputElement.value;
            }
        });
    }


    let latitude, longitude;

    if (id) {
        // Editing existing thing
        // Editing existing thing
        // Find the existing thing using string comparison for ID compatibility
        const existingThing = getThings().find(thing => thing.id === id);
        if (existingThing) {
            latitude = existingThing.latitude;
            longitude = existingThing.longitude;
        } else {
            console.error("Existing thing not found with ID:", id);
            // Handle the case where the thing is not found - perhaps close modal or show error
            hideLoadingSpinner();
            closeModals();
            return; // Stop the form submission process
        }
    } else {
        // Adding new thing
        let location = currentMarkerLocation;
        if (!location) {
            // Default to map center if no marker location is set
            location = map.getCenter();
        }
        latitude = location.lat;
        longitude = location.lng;
    }


    const thing = {
        latitude: latitude,
        longitude: longitude,
        type: type,
        details: details,
        note: note,
        color: color // Add the color to the thing object
    };

    // Only include id if it exists (for updates)
    if (id) {
        thing.id = id;
    }

    if (id) {
        // Update existing thing in array and DB
        const things = getThings();
        const index = things.findIndex(t => t.id === id);
        if (index !== -1) {
            things[index] = thing;
            setThings(things);
            await updateThing(thing); // Corrected function call
        }
    } else {
        // Add new thing to array and DB
        const savedThing = await saveThing(thing);
        const things = getThings();
        things.push(savedThing);
        setThings(things);
    }

    renderThingsOnMap(); // Re-render map after saving/updating
    hideLoadingSpinner(); // Hide spinner after saving/updating
    closeModals();
});

// Initial population of thing types when the script loads
populateThingTypeSelect(thingTypeSelect);
populateFilterSidebar(filterTypeSelect); // Populate the filter select

export { openThingModal, closeModals, importModal, thingModal };