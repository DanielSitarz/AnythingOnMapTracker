import { getLilacs, setLilacs, renderLilacsOnMap } from './map.js';
import { saveLilacToDB, clearAllLilacsFromDB } from './database.js';
import { closeModals } from './modals.js';

// Function to export lilacs to CSV
function exportLilacsToCsv() {
    const lilacs = getLilacs();
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
async function processCsvImport(file) {
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: async function(results) {
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
                    setLilacs(importedLilacs);
                    // Clear existing data in DB and save new data
                    await clearAllLilacsFromDB();
                    for (const lilac of importedLilacs) {
                        await saveLilacToDB(lilac);
                    }
                    renderLilacsOnMap();
                    closeModals();
                } else if (importOption === 'merge') {
                    // Simple merge: add imported lilacs to existing ones
                    // Note: This doesn't handle potential duplicates based on location/properties
                    const currentLilacs = getLilacs();
                    for (const lilac of importedLilacs) {
                        const savedLilac = await saveLilacToDB(lilac);
                        currentLilacs.push(savedLilac);
                    }
                    setLilacs(currentLilacs);
                    renderLilacsOnMap();
                    closeModals();
                }
            }
        });
    } else {
        alert("Please select a CSV file to import.");
    }
}

export { exportLilacsToCsv, processCsvImport };