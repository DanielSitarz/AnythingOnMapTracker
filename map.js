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

// Function to render things on the map, with optional type filter
function renderThingsOnMap(filterType = '') {
    // Clear existing markers (if any)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const thingsToRender = filterType
        ? things.filter(thing => thing.type === filterType)
        : things;

    thingsToRender.forEach(thing => {
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
    // Re-render map with current filter
    const currentFilter = document.getElementById('filter-type').value;
    renderThingsOnMap(currentFilter);
}

let currentMarkerLocation = null; // To store location when adding from button

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

export { map, renderThingsOnMap, currentMarkerLocation, setThings, getThings };