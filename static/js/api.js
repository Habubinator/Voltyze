// api.js

const API_URL = 'http://localhost:8000/api';

// Utility function for making GET requests
async function getRequest(url) {
    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('voltyze_token')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error making GET request:', error);
    }
}

// Utility function for making POST requests
async function postRequest(url, data) {
    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('voltyze_token')}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error making POST request:', error);
    }
}

// Fetch all stations
async function fetchStations() {
    console.log(1)
    return await getRequest('/stations/radius');
}

// Fetch a specific station by ID
async function fetchStationById(stationId) {
    return await getRequest(`/station/${stationId}`);
}

// Save a station to favorites
async function saveToFavorites(stationId) {
    return await postRequest('/favorite', { stationId });
}

// Get user's saved stations
async function fetchSavedStations() {
    return await getRequest('/user/favorites');
}
