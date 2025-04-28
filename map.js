import { deleteThingFromDB } from './database.js';
import { openThingModal } from './modals.js';
import { getThingConfig } from './thingsConfig.js';

// Initialize the map
const map = L.map('map').setView([50.0647, 19.9450], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let things = []; // Store thing data locally

// Store map layers by thing ID for easier access
const thingLayers = new Map();

// Function to render things on the map
function renderThingsOnMap() {
    // Clear existing markers (if any)
    thingLayers.forEach(layer => {
        map.removeLayer(layer);
    });
    thingLayers.clear();

    things.forEach(thing => {
        const thingConfig = getThingConfig(thing.type);
        const markerColor = thingConfig ? thingConfig.markerColor : 'blue'; // Default to blue if config not found

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

        const marker = L.marker([thing.latitude, thing.longitude], { icon: icon }).addTo(map);

        let popupContent = `<b>Type:</b> ${thing.type}<br>`;
        if (thing.details) {
            for (const [key, value] of Object.entries(thing.details)) {
                popupContent += `<b>${key}:</b> ${value}<br>`;
            }
        }
        if (thing.note) {
             popupContent += `<b>Note:</b> ${thing.note}<br>`;
        }
        popupContent += `<button class="edit-thing" data-id="${thing.id}">Edit</button>
                         <button class="delete-thing" data-id="${thing.id}">Delete</button>`;

        marker.bindPopup(popupContent);

        marker.on('popupopen', function() {
            document.querySelector(`.edit-thing[data-id="${thing.id}"]`).addEventListener('click', handleEditThing);
            document.querySelector(`.delete-thing[data-id="${thing.id}"]`).addEventListener('click', handleDeleteThing);
        });

        thingLayers.set(thing.id, marker); // Store the marker layer
    });
}

// Function to filter map markers by types
function filterMapByTypes(typesToShow) {
    thingLayers.forEach((layer, thingId) => {
        const thing = things.find(t => t.id === thingId);
        if (thing) {
            if (typesToShow.includes(thing.type)) {
                if (!map.hasLayer(layer)) {
                    map.addLayer(layer);
                }
            } else {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            }
        }
    });
}

// Function to handle editing a thing
function handleEditThing(event) {
    const thingId = parseInt(event.target.dataset.id);
    const thingToEdit = things.find(thing => thing.id === thingId);
    if (thingToEdit) {
        console.log("Editing thing:", thingToEdit);
        openThingModal('Edit Thing', thingToEdit);
    }
}

// Function to handle deleting a thing
async function handleDeleteThing(event) {
    const thingId = parseInt(event.target.dataset.id);
    console.log("Deleting thing with ID:", thingId);
    // Remove from array
    things = things.filter(thing => thing.id !== thingId);
    // Remove from DB
   await deleteThingFromDB(thingId);
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
    const radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters of this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

function setThings(newThings) {
    things = newThings;
}

function getThings() {
    return things;
}

export { map, renderThingsOnMap, setThings, getThings, filterMapByTypes, setCurrentMarkerLocation, currentMarkerLocation };