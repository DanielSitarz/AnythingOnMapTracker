// JSONBin.io Configuration UI Module

/**
 * Renders the JSONBin.io specific configuration fields into a container element.
 * @param {HTMLElement} containerElement The element to render the fields into.
 * @param {Object} currentConfig The current configuration for JSONBin.io.
 */
function renderJsonBinConfig(containerElement, currentConfig = {}) {
    containerElement.innerHTML = `
        <div>
            <label for="jsonbin-id">Bin ID:</label>
            <input type="text" id="jsonbin-id" value="${currentConfig.binId || ''}" placeholder="Enter your JSONBin.io Bin ID">
        </div>
        <div>
            <label for="jsonbin-master-key">Master Key (Optional):</label>
            <input type="password" id="jsonbin-master-key" value="${currentConfig.masterKey || ''}" placeholder="Enter your JSONBin.io Master Key">
        </div>
        <p>Find your Bin ID and Master Key on <a href="https://jsonbin.io/" target="_blank">JSONBin.io</a>.</p>
    `;
}

/**
 * Reads the values from the JSONBin.io configuration fields within a container element.
 * @param {HTMLElement} containerElement The element containing the fields.
 * @returns {Object} An object containing the JSONBin.io configuration (e.g., { binId: '...' }).
 */
function getJsonBinConfig(containerElement) {
    const binIdInput = containerElement.querySelector('#jsonbin-id');
    const masterKeyInput = containerElement.querySelector('#jsonbin-master-key');
    return {
        binId: binIdInput ? binIdInput.value.trim() : '',
        masterKey: masterKeyInput ? masterKeyInput.value.trim() : ''
    };
}

export {
    renderJsonBinConfig,
    getJsonBinConfig
};