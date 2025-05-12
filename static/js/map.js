// Global map object to make it accessible in other functions
let map;

const VALUES = {
    STATUS: {
        STATION: [
            "Online",
            "Offline",
            "Service",
            "Building",
            "API_ERROR",
        ],
        CONNECTOR: [
            "Available",
            "Occupied",
            "Charging",
            "Finishing",
            "Reserved",
            "Service",
            "Error",
        ],
    },
    NETWORK: ["Hubject", "eON", "EmBW", "TOKA", "Ionity", "NULL"],
    CONNECTOR: [
        "CCS2",
        "CCS1",
        "GBTDC",
        "Chademo",
        "Type2plug",
        "Type2",
        "Type1",
        "GBTAC",
        "Nacs",
        "CCS1|CCS2",
        "Type2|Type1",
        "Chademo|GBTDC",
    ],
    CONNECTORTYPE: {
        BINARY: {
            CCS2: `b'1000000000000000'`, //32768
            CCS1: `b'0100000000000000'`, //16384
            GBTDC: `b'0010000000000000'`, //8192
            Chademo: `b'0001000000000000'`, //4096
            Type2plug: `b'0000100000000000'`, //2048
            Type2: `b'0000010000000000'`, //1024
            Type1: `b'0000001000000000'`, //512
            GBTAC: `b'0000000100000000'`, //256
            Nacs: `b'0000000010000000'`, //128
            "CCS1|CCS2": `b'0000000001000000'`, //64
            "Type2|Type1": `b'0000000000100000'`, //32
        },
        DECIMAL: {
            CCS2: 32768, // b'1000000000000000'
            CCS1: 16384, // b'0100000000000000'
            GBTDC: 8192, // b'0010000000000000'
            Chademo: 4096, // b'0001000000000000'
            Type2plug: 2048, // b'0000100000000000'
            Type2: 1024, // b'0000010000000000'
            Type1: 512, // b'0000001000000000'
            GBTAC: 256, // b'0000000100000000'
            Nacs: 128, // b'0000000010000000'
            "CCS1|CCS2": 64, // b'0000000001000000'
            "Type2|Type1": 32, // b'0000000000100000'
        },
    },
};

// Initialize the map
function initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZzB0MGgzbGwiLCJhIjoiY205OGd3NG54MDJkNTJsczZ6ZTExZGRpayJ9.gCdhBaZw-_MRyA8WIjtq-g';

    map = new mapboxgl.Map({
        container: 'map', // ID of the container element
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [30.644, 50.4501], // Initial map center (Kyiv, for example)
        zoom: 12
    });

    // Add navigation controls to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Load the charging stations data and display on the map
    fetchStations().then(stations => {
        if (!stations) {
            console.error('No stations found.');
            return;
        }
        console.log(stations);

        stations.data.forEach(station => {
            if (station.longitude && station.latitude) {
                const stationDetails = station.station_description[0]; // Assuming first description entry contains the needed data

                // Create the marker
                const marker = new mapboxgl.Marker()
                    .setLngLat([station.longitude, station.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                    <div id="station-popup" class="station-popup">
                        <div class="popup-header">
                            <h2 id="station-name">${stationDetails.station_name || "Назва станції"}</h2>
                        </div>
                        <div class="popup-content">
                            <div class="station-info">
                                <p id="station-address">${stationDetails.location_name || "Адреса станції"}</p>
                                <p id="station-status" class="status">
                                    Статус: <span>${VALUES.STATUS.STATION[stationDetails.status_id]}</span>
                                </p>
                            </div>

                            <div class="connector-list" id="connector-list">
                                ${stationDetails.station_connector.map(connector => `
                                    <div class="connector">
                                        <p><strong>Тип:</strong> ${VALUES.CONNECTOR[connector.connector_type_id] || "Невідомий тип"}</p>
                                        <p><strong>Потужність:</strong> ${connector.power_kw} kW</p>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="station-details">
                                <p id="station-description">${stationDetails.station_description || "Опис станції"}</p>

                                <div class="station-features">
                                    <span class="feature" id="feature-24h"><i class="fas fa-clock"></i> ${stationDetails.is_open_24x7 ? "24/7" : "Не 24/7"}</span>
                                    <span class="feature" id="feature-public"><i class="fas fa-users"></i> ${stationDetails.is_public ? "Публічна" : "Приватна"}</span>
                                    <span class="feature" id="feature-fast"><i class="fas fa-bolt"></i> ${stationDetails.is_fast_charger ? "Швидка зарядка" : "Звичайна зарядка"}</span>
                                </div>

                                <div class="station-contact">
                                    <p id="station-phone"><i class="fas fa-phone"></i> <span>${stationDetails.support_phone || "+380123456789"}</span></p>
                                </div>
                            </div>

                            <div class="station-actions">
                                <button id="save-station" class="action-btn"><i class="far fa-bookmark"></i> Зберегти</button>
                                <button id="navigate-btn" class="action-btn primary"><i class="fas fa-directions"></i> Прокласти маршрут</button>
                            </div>

                            <div class="station-comments">
                                <h3>Відгуки</h3>
                                <div id="comments-list">
                                    ${stationDetails.comments.map(comment => `
                                        <div class="comment">
                                            <p><strong>${comment.author_name}</strong> (Рейтинг: ${comment.rating})</p>
                                            <p>${comment.comment_text}</p>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-comment" id="add-comment-section">
                                    <!-- Add comment form will be loaded by JS based on auth status -->
                                </div>
                            </div>
                        </div>
                    </div>
                `))
                    .addTo(map);
            } else {
                console.error('Invalid coordinates for station:', station);
            }
        });
    });

}

// Open the station's popup with detailed information
function openStationPopup(stationId) {
    fetchStationById(stationId).then(station => {
        const popup = new mapboxgl.Popup()
            .setHTML(`
                    <h3>${station.name}</h3>
                    <p>${station.description}</p>
                    <p>Address: ${station.address}</p>
                    <button onclick="saveToFavorites(${station.id})">Save to Favorites</button>
                `);
        new mapboxgl.Marker()
            .setLngLat([station.longitude, station.latitude])
            .setPopup(popup)
            .addTo(map);
    });
}

document.addEventListener('DOMContentLoaded', initMap);