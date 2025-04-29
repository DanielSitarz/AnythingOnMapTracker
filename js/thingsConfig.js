let thingsConfig = [];

async function loadThingsConfig() {
    try {
        const response = await fetch('./things.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        thingsConfig = await response.json();
        console.log("Things configuration loaded:", thingsConfig);
        // Ensure each thing config has a color property, default to a gray color if not present
        thingsConfig = thingsConfig.map(config => {
            if (!config.color) {
                config.color = '#808080'; // Default gray color
            }
            return config;
        });
        // After loading, populate the selects and the filter sidebar
        populateThingTypeSelect(document.getElementById('thing-type'));
        populateFilterSidebar(document.getElementById('filter-type-list'));
    } catch (error) {
        console.error("Failed to load things configuration:", error);
    }
}

function getThingsConfig() {
    return thingsConfig;
}

function getThingConfig(type) {
    return thingsConfig.find(config => config.type === type);
}

// Function to populate the thing type select in the modal
function populateThingTypeSelect(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options
    thingsConfig.forEach(config => {
        const option = document.createElement('option');
        option.value = config.type;
        option.textContent = config.type;
        selectElement.appendChild(option);
    });
}

// Function to populate the filter sidebar list
function populateFilterSidebar(listElement) {
    if (!listElement) return;
    listElement.innerHTML = ''; // Clear existing items

    // Add the "Show All" option
    const allItem = document.createElement('li');
    allItem.dataset.type = '';
    allItem.textContent = 'Show All Types';
    allItem.classList.add('selected'); // Initially show all
    listElement.appendChild(allItem);

    thingsConfig.forEach(config => {
        const listItem = document.createElement('li');
        listItem.dataset.type = config.type;
        listItem.textContent = config.type;
        listItem.classList.add('selected'); // Initially show all
        listElement.appendChild(listItem);
    });
}


// Load config when the script is loaded
loadThingsConfig();

export { loadThingsConfig, getThingsConfig, getThingConfig, populateThingTypeSelect, populateFilterSidebar };