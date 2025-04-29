import { loadConfig, setSelectedProviderName, getProviderConfig, setProviderConfig } from './configStorage.js';
// Import provider-specific configuration rendering functions
import { renderJsonBinConfig, getJsonBinConfig } from './jsonBinConfigUI.js';

const configModal = document.getElementById('config-modal');
const closeConfigModalBtn = configModal.querySelector('.close');
const providerSelect = document.getElementById('provider-select');
const providerConfigContainer = document.getElementById('provider-config-container');
const configForm = document.getElementById('config-form');
const configBtn = document.getElementById('config-btn');

// Define available providers and their configuration UI functions
const availableProviders = {
    indexedDB: {
        name: 'IndexedDB (Local)',
        renderConfig: () => { providerConfigContainer.innerHTML = ''; }, // No specific config UI needed
        getConfig: () => ({}) // No specific config to get
    },
    jsonBin: {
        name: 'JSONBin.io (Online)',
        renderConfig: renderJsonBinConfig,
        getConfig: getJsonBinConfig
    }
    // Add other providers here
};

// Function to open the config modal
function openConfigModal() {
    configModal.style.display = 'block';
    populateProviderSelect();
    loadCurrentConfig();
}

// Function to close the config modal
function closeConfigModal() {
    configModal.style.display = 'none';
}

// Function to populate the provider select dropdown
function populateProviderSelect() {
    providerSelect.innerHTML = ''; // Clear existing options
    for (const providerId in availableProviders) {
        const option = document.createElement('option');
        option.value = providerId;
        option.textContent = availableProviders[providerId].name;
        providerSelect.appendChild(option);
    }
}

// Function to render provider-specific configuration fields
function renderProviderConfigFields(providerId, currentConfig) {
    const provider = availableProviders[providerId];
    if (provider && provider.renderConfig) {
        provider.renderConfig(providerConfigContainer, currentConfig);
    } else {
        providerConfigContainer.innerHTML = ''; // Clear container if no specific config
    }
}

// Function to load the current configuration and populate the modal
function loadCurrentConfig() {
    const config = loadConfig();
    const selectedProvider = config.selectedProvider || 'indexedDB'; // Default to indexedDB

    // Set the selected provider in the dropdown
    providerSelect.value = selectedProvider;

    // Render the configuration fields for the selected provider
    renderProviderConfigFields(selectedProvider);

    // Populate provider-specific fields with saved config
    const providerConfig = getProviderConfig(selectedProvider);
    if (providerConfig) {
        // Provider-specific fields are populated by the renderProviderConfigFields function
        // when called with the currentConfig.
    }
}

// Event listeners
configBtn.addEventListener('click', openConfigModal);
closeConfigModalBtn.addEventListener('click', closeConfigModal);

// Close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === configModal) {
        closeConfigModal();
    }
});

// Handle provider selection change
providerSelect.addEventListener('change', (event) => {
    const selectedProviderId = event.target.value;
    renderProviderConfigFields(selectedProviderId);
});

// Handle form submission to save configuration
configForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedProviderId = providerSelect.value;
    setSelectedProviderName(selectedProviderId);

    // Get and save provider-specific configuration
    const provider = availableProviders[selectedProviderId];
    if (provider && provider.getConfig) {
        const providerConfig = provider.getConfig(providerConfigContainer);
        setProviderConfig(selectedProviderId, providerConfig);
    }

    console.log("Configuration saved.");
    // Dispatch a custom event to notify other parts of the application (e.g., main.js)
    // that the configuration has been saved and data might need to be reloaded.
    window.dispatchEvent(new CustomEvent('configSaved'));

    closeConfigModal();
});

// Initial population of provider select when the script loads
populateProviderSelect();

// TODO: Need a way for main.js to know which provider is selected on initial load
// and when the config is saved. This might involve:
// 1. main.js calling a function in configModal.js to get the selected provider.
// 2. configModal.js dispatching a custom event when config is saved.
// 3. A central data manager (database.js) reading the config on load.

// Export functions if needed by other modules
export { openConfigModal };