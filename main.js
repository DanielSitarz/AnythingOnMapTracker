import { loadThingsFromDB } from './database.js';
import { renderThingsOnMap, setThings, filterMapByTypes } from './map.js'; // Import filterMapByTypes
import { getThingsConfig } from './thingsConfig.js'; // Import getThingsConfig

const filterSidebar = document.getElementById('filter-sidebar');
const filterSidebarToggle = document.getElementById('filter-sidebar-toggle');
const closeSidebarBtn = document.querySelector('#filter-sidebar .close-sidebar-btn');
const filterTypeList = document.getElementById('filter-type-list');
const addThingBtn = document.getElementById('add-thing-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');

let selectedTypes = new Set();

// Function to update the map filter based on selected types
function updateMapFilter() {
    const typesToFilter = selectedTypes.size === 0 || selectedTypes.has('')
        ? getThingsConfig().map(config => config.type) // Show all if 'Show All' is selected or no types are selected
        : Array.from(selectedTypes).filter(type => type !== ''); // Filter out '' if specific types are selected

    filterMapByTypes(typesToFilter);
}

// Handle filter sidebar toggle
filterSidebarToggle.addEventListener('click', () => {
    filterSidebar.classList.toggle('open');
});

// Handle close sidebar button
closeSidebarBtn.addEventListener('click', () => {
    filterSidebar.classList.remove('open');
});

// Handle clicks on type list items
filterTypeList.addEventListener('click', (event) => {
    const listItem = event.target.closest('li');
    if (!listItem) return;

    const type = listItem.dataset.type;

    if (type === '') { // Handle "Show All Types"
        selectedTypes.clear();
        filterTypeList.querySelectorAll('li').forEach(item => {
            item.classList.remove('selected');
        });
        listItem.classList.add('selected');
    } else {
        // If "Show All Types" is currently selected, deselect it
        if (selectedTypes.has('')) {
            selectedTypes.delete('');
            filterTypeList.querySelector('li[data-type=""]').classList.remove('selected');
        }

        if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
            listItem.classList.remove('selected');
        } else {
            selectedTypes.add(type);
            listItem.classList.add('selected');
        }

        // If no specific types are selected, select "Show All Types"
        if (selectedTypes.size === 0) {
             filterTypeList.querySelector('li[data-type=""]').classList.add('selected');
             selectedTypes.add('');
        }
    }

    updateMapFilter();
});


// Initial load of things from DB and render on map
loadThingsFromDB().then(things => {
    setThings(things);
    renderThingsOnMap();
    // Initialize selected types after config is loaded and sidebar populated
    selectedTypes.add(''); // Start with "Show All Types" selected
    updateMapFilter(); // Apply initial filter
}).catch(error => {
    console.error("Failed to load things on startup:", error);
});

// Assuming button event listeners are handled elsewhere (e.g., modals.js or csv.js)
// Ensure those scripts are updated to target the buttons in the bottom bar if necessary.
// If they are handled in main.js, they will automatically target the correct elements
// as the IDs remain the same.