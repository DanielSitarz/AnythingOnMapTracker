import { saveLilacToDB, deleteLilacFromDB, updateLilacInDB } from './database.js';
import { openLilacModal } from './modals.js';

// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let lilacs = []; // Store lilac data locally

// Function to render lilacs on the map
function renderLilacsOnMap() {
    // Clear existing markers (if any)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    lilacs.forEach(lilac => {
        const marker = L.marker([lilac.latitude, lilac.longitude]).addTo(map);
        marker.bindPopup(`
            <b>Color:</b> ${lilac.color}<br>
            <b>Timing:</b> ${lilac.timing}<br>
            ${lilac.note ? `<b>Note:</b> ${lilac.note}<br>` : ''}
            <button class="edit-lilac" data-id="${lilac.id}">Edit</button>
            <button class="delete-lilac" data-id="${lilac.id}">Delete</button>
        `);
         marker.on('popupopen', function() {
            document.querySelector(`.edit-lilac[data-id="${lilac.id}"]`).addEventListener('click', handleEditLilac);
            document.querySelector(`.delete-lilac[data-id="${lilac.id}"]`).addEventListener('click', handleDeleteLilac);
        });
    });
}

// Function to handle editing a lilac
function handleEditLilac(event) {
    const lilacId = parseInt(event.target.dataset.id);
    const lilacToEdit = lilacs.find(lilac => lilac.id === lilacId);
    if (lilacToEdit) {
        console.log("Editing lilac:", lilacToEdit);
        openLilacModal('Edit Lilac', lilacToEdit);
    }
}

// Function to handle deleting a lilac
async function handleDeleteLilac(event) {
    const lilacId = parseInt(event.target.dataset.id);
    console.log("Deleting lilac with ID:", lilacId);
    // Remove from array
    lilacs = lilacs.filter(lilac => lilac.id !== lilacId);
    // Remove from DB
    await deleteLilacFromDB(lilacId);
    // Re-render map
    renderLilacsOnMap();
}

let currentMarkerLocation = null; // To store location when adding from button

// Update map click handler to open modal
map.on('click', function(e) {
    currentMarkerLocation = e.latlng;
    openLilacModal('Add Lilac');
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

function setLilacs(newLilacs) {
    lilacs = newLilacs;
}

function getLilacs() {
    return lilacs;
}

export { map, renderLilacsOnMap, currentMarkerLocation, setLilacs, getLilacs };