import { deleteThing } from './utils/database.js';
import { openThingModal } from './ui/modals.js';
import { getThingConfig } from './thingsConfig.js';

// Initialize the map
const map = L.map('map', { maxZoom: 20 }).setView([50.0647, 19.9450], 8);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20
}).addTo(map);

let things = []; // Store thing data locally

// Store map layers by thing ID for easier access
const thingLayers = new Map();
const markerClusterGroup = L.markerClusterGroup();
map.addLayer(markerClusterGroup);

// Function to render things on the map
function renderThingsOnMap() {
    // Clear existing markers (if any)
    markerClusterGroup.clearLayers();
    thingLayers.clear();

    things.forEach(thing => {
        const thingConfig = getThingConfig(thing.type);
        // Use thing's color if available, otherwise use config color, default to blue
        const markerColor = thing.color || (thingConfig ? thingConfig.color : 'blue');

        const markerHtmlStyles = `
            background-color: ${markerColor};
            width: 3rem;
            height: 3rem;
            display: block;
            left: -1.5rem;
            top: -1.5rem;
            position: relative;
            border-radius: 3rem 3rem 0;
            transform: rotate(45deg);
            border: 1px solid #FFFFFF`;

        const icon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerHtmlStyles}" />`
        });

        const marker = L.marker([thing.latitude, thing.longitude], { icon: icon });

        let popupContent = `
            <div class="popup-content">
                <h3>${thing.type}</h3>
                <div class="popup-details">
        `;

        if (thing.details) {
            for (const [key, value] of Object.entries(thing.details)) {
                popupContent += `<p><b>${key}:</b> ${value}</p>`;
            }
        }
        if (thing.note) {
             popupContent += `<p><b>Note:</b> ${thing.note}</p>`;
        }

        popupContent += `
                </div>
                <div class="popup-actions">
                    <button class="btn edit-thing" data-id="${thing.id}">Edit</button>
                    <button class="btn delete-thing" data-id="${thing.id}">Delete</button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'modern-popup' // Add a class for custom styling
        });

        marker.on('popupopen', function() {
            document.querySelector(`.edit-thing[data-id="${thing.id}"]`).addEventListener('click', handleEditThing);
            document.querySelector(`.delete-thing[data-id="${thing.id}"]`).addEventListener('click', handleDeleteThing);
        });

        thingLayers.set(thing.id, marker); // Store the marker layer
    });
    markerClusterGroup.addLayers(Array.from(thingLayers.values()));
}

// Function to filter map markers by types
function filterMapByTypes(typesToShow) {
    markerClusterGroup.clearLayers(); // Clear all layers from the cluster group
    const layersToShow = [];
    thingLayers.forEach((layer, thingId) => {
        const thing = things.find(t => t.id === thingId);
        if (thing && typesToShow.includes(thing.type)) {
            layersToShow.push(layer);
        }
    });
    markerClusterGroup.addLayers(layersToShow); // Add only the filtered layers back
}

// Function to handle editing a thing
function handleEditThing(event) {
    const thingId = event.target.dataset.id;
    const thingToEdit = things.find(thing => thing.id === thingId);
    if (thingToEdit) {
        console.log("Editing thing:", thingToEdit);
        openThingModal('Edit Thing', thingToEdit);
    }
}

// Function to handle deleting a thing
async function handleDeleteThing(event) {
    const thingId = event.target.dataset.id;
    console.log("Deleting thing with ID:", thingId);
    // Remove from array
    things = things.filter(thing => thing.id !== thingId);
    // Remove from DB
   await deleteThing(thingId);
   // Remove the layer from the map and the map
   if (thingLayers.has(thingId)) {
       const layer = thingLayers.get(thingId);
       if (map.hasLayer(layer)) {
           map.removeLayer(layer);
       }
       thingLayers.delete(thingId);
   }
   // The filter will be reapplied by the main.js logic after deletion
}

let currentMarkerLocation = null; // To store location when adding from button

function setCurrentMarkerLocation(location) {
    currentMarkerLocation = location;
}

// Update map click handler to open modal
map.on('click', function(e) {
    currentMarkerLocation = e.latlng;
    openThingModal('Add Thing');
});

// Geolocation
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    // Location found, but we don't add a default marker or circle
    // The map view is already set by map.locate({setView: true, maxZoom: 16});
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

function setThings(newThings) {
    // Check if the data is in the { "things": [...] } format from JSONBIN.io
    if (newThings && typeof newThings === 'object' && Array.isArray(newThings.things)) {
        things = newThings.things;
    } else {
        // Otherwise, assume it's already the array of things
        things = newThings;
    }
}

function getThings() {
    return things;
}

function refreshCurrentLocation() {
    map.locate({setView: true, maxZoom: 16});
}

export { map, renderThingsOnMap, setThings, getThings, filterMapByTypes, setCurrentMarkerLocation, currentMarkerLocation, refreshCurrentLocation };