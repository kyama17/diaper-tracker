// script.js

// Functions that contain core logic, made global for testing
function getLogs() {
    return JSON.parse(localStorage.getItem('logs')) || [];
}

function saveLogs(logs) {
    localStorage.setItem('logs', JSON.stringify(logs));
}

function addLog(type, time) {
    const logs = getLogs();
    // Ensure eventTimeInput is available or pass its value if this function is called before DOM ready
    // For testing, we'll pass time directly.
    const eventTimeValue = time || document.getElementById('eventTime').value; 
    if (eventTimeValue) {
        const logEntry = { type, time: eventTimeValue, id: Date.now() };
        logs.push(logEntry);
        saveLogs(logs);
        renderLogs(); // Assumes DOM is ready when addLog is called by user
    }
}

function deleteLog(id) {
    let logs = getLogs();
    logs = logs.filter(log => log.id !== id);
    saveLogs(logs);
    renderLogs(); // Assumes DOM is ready
}

function renderLogs() {
    // This function heavily depends on DOM elements like logList
    const logList = document.getElementById('logList');
    if (!logList) { // Guard clause for when tests run before DOM fully interactive for this element
        console.warn("logList element not found during renderLogs. If running tests, ensure DOM is ready or mock.");
        return;
    }
    logList.innerHTML = ''; // Clear existing logs
    const logs = getLogs();
    logs.sort((a, b) => new Date(b.time) - new Date(a.time)); 

    logs.forEach(log => {
        const listItem = document.createElement('li');
        const eventTypeDisplay = log.type === 'pee' ? 'おしっこ' : 'うんち';
        const displayTime = new Date(log.time).toLocaleString('ja-JP');
        listItem.textContent = `${displayTime} - ${eventTypeDisplay}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        // Important: For tests, ensure deleteLog is accessible globally or passed correctly
        deleteButton.onclick = () => deleteLog(log.id); 
        listItem.appendChild(deleteButton);

        logList.appendChild(listItem);
    });
}

function loadLogs() {
    renderLogs();
}

// DOM-dependent initializations
document.addEventListener('DOMContentLoaded', () => {
    const logForm = document.getElementById('logForm');
    const eventTimeInput = document.getElementById('eventTime');

    if (!eventTimeInput) {
        console.error("eventTimeInput not found. Critical for app functionality.");
        return;
    }
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    eventTimeInput.value = now.toISOString().slice(0, 16);

    loadLogs();

    if (logForm) {
        logForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const eventType = document.getElementById('eventType').value;
            // addLog will now read from eventTimeInput directly if 'time' param is not provided
            addLog(eventType, eventTimeInput.value); 
            logForm.reset();
            // Reset time to current after submission
            eventTimeInput.value = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16);
        });
    } else {
        console.error("logForm not found. Critical for app functionality.");
    }

    // Expose functions for testing if needed, or rely on them being global
    // window.addLog = addLog; 
    // window.getLogs = getLogs;
    // window.deleteLog = deleteLog;
    // window.loadLogs = loadLogs;
    // window.renderLogs = renderLogs; // Expose if tests need to call it directly
});

// Make functions globally accessible for test.js
// This is a simple way; modules (ES6, CommonJS) would be better for larger apps.
window.addLog = addLog;
window.getLogs = getLogs;
window.deleteLog = deleteLog;
window.loadLogs = loadLogs;
window.renderLogs = renderLogs; // Though test.js doesn't call it directly, it's called by others
window.saveLogs = saveLogs; // If tests need to manipulate logs directly
