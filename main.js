import { loadLilacsFromDB } from './database.js';
import { renderLilacsOnMap, setLilacs } from './map.js'; // Import map as well for button handlers


// Initial load of lilacs from DB and render on map
loadLilacsFromDB().then(lilacs => {
    setLilacs(lilacs);
    renderLilacsOnMap();
}).catch(error => {
    console.error("Failed to load lilacs on startup:", error);
});