import { getThings, setThings, renderThingsOnMap } from './map.js';
import { saveThingToDB, clearAllThingsFromDB } from './database.js';
import { closeModals } from './modals.js';

// Function to export things to CSV
function exportThingsToCsv() {
    const things = getThings();

    // Determine all unique detail keys across all things
    const detailKeys = new Set();
    things.forEach(thing => {
        if (thing.details) {
            Object.keys(thing.details).forEach(key => detailKeys.add(key));
        }
    });

    const csvData = things.map(thing => {
        const item = {
            type: thing.type,
            latitude: thing.latitude,
            longitude: thing.longitude,
            note: thing.note || '' // Ensure note is not undefined
        };
        // Add detail properties
        detailKeys.forEach(key => {
            item[key] = thing.details ? thing.details[key] || '' : ''; // Add detail value or empty string
        });
        return item;
    });

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'thing_tracker_data.csv');
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
                const importedThings = results.data.map(item => {
                    const thing = {
                        type: item.type,
                        latitude: parseFloat(item.latitude),
                        longitude: parseFloat(item.longitude),
                        note: item.note || '',
                        details: {}
                    };
                    // Extract detail properties (all columns except type, latitude, longitude, note)
                    Object.keys(item).forEach(key => {
                        if (!['type', 'latitude', 'longitude', 'note'].includes(key)) {
                            thing.details[key] = item[key];
                        }
                    });
                    return thing;
                }).filter(thing => !isNaN(thing.latitude) && !isNaN(thing.longitude) && thing.type); // Filter out invalid entries

                const importOption = document.querySelector('input[name="import-option"]:checked').value;

                if (importOption === 'overwrite') {
                    setThings(importedThings);
                    // Clear existing data in DB and save new data
                    await clearAllThingsFromDB();
                    for (const thing of importedThings) {
                        await saveThingToDB(thing);
                    }
                    renderThingsOnMap();
                    closeModals();
                } else if (importOption === 'merge') {
                    // Simple merge: add imported things to existing ones
                    // Note: This doesn't handle potential duplicates based on location/properties
                    const currentThings = getThings();
                    for (const thing of importedThings) {
                        const savedThing = await saveThingToDB(thing);
                        currentThings.push(savedThing);
                    }
                    setThings(currentThings);
                    renderThingsOnMap();
                    closeModals();
                }
            }
        });
    } else {
        alert("Please select a CSV file to import.");
    }
}

export { exportThingsToCsv, processCsvImport };