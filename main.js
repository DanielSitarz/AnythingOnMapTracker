import { loadThingsFromDB } from './database.js';
import { renderThingsOnMap, setThings } from './map.js'; // Import map as well for button handlers


// Initial load of things from DB and render on map
loadThingsFromDB().then(things => {
    setThings(things);
    renderThingsOnMap();
}).catch(error => {
    console.error("Failed to load things on startup:", error);
});