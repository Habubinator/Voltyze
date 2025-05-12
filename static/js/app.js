// app.js

// Show the map view
function showMapView() {
    document.getElementById('map').style.display = 'block';
    document.getElementById('station-popup').style.display = 'none';
}

// Show the station details popup
function showStationDetails(stationId) {
    document.getElementById('map').style.display = 'none';
    document.getElementById('station-popup').style.display = 'block';

    // Populate the station details in the popup
    fetchStationById(stationId).then(station => {
        document.getElementById('station-name').innerText = station.name;
        document.getElementById('station-address').innerText = station.address;
        document.getElementById('station-description').innerText = station.description;
        document.getElementById('station-status').innerText = station.status;
        document.getElementById('save-station').onclick = () => saveToFavorites(station.id);
    });
}

// Event listeners to switch between views (map and station details)
document.getElementById('close-popup').addEventListener('click', () => {
    showMapView();
});

document.getElementById('navigate-btn').addEventListener('click', () => {
    // Redirect or show navigation route (example logic)
    alert('Navigate to the station');
});

document.getElementById('save-station').addEventListener('click', () => {
    alert('Station saved to favorites');
});
