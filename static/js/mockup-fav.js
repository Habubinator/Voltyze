// Mockup data
const mockupStations = [
    {
        id: 1,
        name: "Станція FastCharge",
        address: "вул. Центральна, 1",
        status: "Online",
        connectorType: "CCS2",
        powerKw: 50,
        open24x7: true,
        isPublic: true,
        isFast: true,
        description: "Швидка зарядна станція з доступом 24/7",
        phone: "+380123456789",
        comments: [
            { author: "Іван", rating: 5, text: "Чудова станція!" },
            { author: "Марія", rating: 4, text: "Все добре, але трохи повільно." }
        ]
    },
    {
        id: 2,
        name: "Станція швидкої зарядки Tesla",
        address: "вул. Спортивна, 5",
        status: "Offline",
        connectorType: "Chademo",
        powerKw: 30,
        open24x7: false,
        isPublic: false,
        isFast: false,
        description: "Станція в процесі обслуговування",
        phone: "+380987654321",
        comments: []
    }
];

// Render the stations to the page
function renderStations() {
    const stationsList = document.getElementById('stations-list');
    mockupStations.forEach(station => {
        const stationElement = document.createElement('div');
        stationElement.classList.add('station-item');
        stationElement.innerHTML = `
            <h3>${station.name}</h3>
            <p><strong>Адреса:</strong> ${station.address}</p>
            <p><strong>Статус:</strong> ${station.status}</p>
            <p><strong>Тип конектора:</strong> ${station.connectorType}</p>
            <p><strong>Потужність:</strong> ${station.powerKw} кВт</p>
            <p><strong>Опис:</strong> ${station.description}</p>
            <p><strong>Телефон:</strong> ${station.phone}</p>
            <button class="action-btn primary" onclick="navigateToStation(${station.id})">Перейти до станції</button>
            <div class="comments">
                <h4>Відгуки:</h4>
                ${station.comments.length > 0 ? station.comments.map(comment => `
                    <div class="comment">
                        <p><strong>${comment.author}</strong> (Рейтинг: ${comment.rating})</p>
                        <p>${comment.text}</p>
                    </div>
                `).join('') : '<p>Немає відгуків.</p>'}
            </div>
        `;
        stationsList.appendChild(stationElement);
    });
}

// Mock function to simulate navigation to the station
function navigateToStation(stationId) {
    const station = mockupStations.find(st => st.id === stationId);
    alert(`Напрямок до: ${station.name}`);
}

// Initialize the page after DOM is loaded
document.addEventListener('DOMContentLoaded', renderStations);