let thingsConfig = [];

async function loadThingsConfig() {
    try {
        const response = await fetch('./things.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        thingsConfig = await response.json();
        console.log("Things configuration loaded:", thingsConfig);
        // After loading, populate the selects
        populateThingTypeSelect(document.getElementById('thing-type'));
        populateFilterTypeSelect(document.getElementById('filter-type'));
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

// Function to populate the filter type select
function populateFilterTypeSelect(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options
    // Add the "Show All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Show All Types';
    selectElement.appendChild(allOption);

    thingsConfig.forEach(config => {
        const option = document.createElement('option');
        option.value = config.type;
        option.textContent = config.type;
        selectElement.appendChild(option);
    });
}


// Load config when the script is loaded
loadThingsConfig();

export { loadThingsConfig, getThingsConfig, getThingConfig, populateThingTypeSelect, populateFilterTypeSelect };