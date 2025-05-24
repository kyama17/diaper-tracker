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
    
    // グラフを更新
    updateCharts();
}

function loadLogs() {
    renderLogs();
}

// DOM-dependent initializations
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const userInfoDiv = document.getElementById('userInfo');
    const userNameSpan = document.getElementById('userName');
    const appContentDiv = document.getElementById('appContent');
    const loadingMessageDiv = document.getElementById('loadingMessage');

    const logForm = document.getElementById('logForm');
    const eventTimeInput = document.getElementById('eventTime');
    const logListUl = document.getElementById('logList');

    // --- Authentication and UI Management ---

    async function fetchUserStatusAndLoadApp() {
        try {
            const response = await fetch('/profile'); // Auth0 SDK provides this if logged in
            if (response.ok) {
                const user = await response.json();
                updateUIForAuthState(user);
                loadLogs(); // Load logs if user is authenticated
            } else {
                // Not authenticated or error fetching profile
                updateUIForAuthState(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            updateUIForAuthState(null);
            // Potentially show a more user-friendly error message
        } finally {
            if(loadingMessageDiv) loadingMessageDiv.style.display = 'none';
        }
    }

    function updateUIForAuthState(user) {
        if (user && user.sub) { // 'sub' is a common field for user ID in OIDC
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'inline-block'; // Or 'block'
            if (userInfoDiv) userInfoDiv.style.display = 'block';
            if (userNameSpan) userNameSpan.textContent = user.name || user.email || user.nickname || 'User';
            if (appContentDiv) appContentDiv.style.display = 'block';
        } else {
            if (loginButton) loginButton.style.display = 'inline-block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (userInfoDiv) userInfoDiv.style.display = 'none';
            if (appContentDiv) appContentDiv.style.display = 'none';
        }
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login'; // Redirect to backend login route
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            window.location.href = '/logout'; // Redirect to backend logout route
        });
    }

    // --- Log Management ---

    async function loadLogs() {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }
            const logs = await response.json();
            renderLogs(logs);
        } catch (error) {
            console.error('Error loading logs:', error);
            if(logListUl) logListUl.innerHTML = '<li>ログの読み込みに失敗しました。</li>';
        }
    }

    function renderLogs(logs) {
        if (!logListUl) return;
        logListUl.innerHTML = ''; // Clear existing logs

        if (!logs || logs.length === 0) {
            logListUl.innerHTML = '<li>記録はありません。</li>';
            return;
        }

        logs.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime)); // Ensure sorting, though API might do it

        logs.forEach(log => {
            const listItem = document.createElement('li');
            const eventTypeDisplay = log.eventType === 'pee' ? 'おしっこ' : 'うんち';
            // Ensure eventTime is valid before calling toLocaleString
            const displayTime = log.eventTime ? new Date(log.eventTime).toLocaleString('ja-JP') : '無効な時間';
            
            listItem.textContent = `${displayTime} - ${eventTypeDisplay} `; // Added space for button

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.onclick = () => deleteLog(log._id); // Use _id from MongoDB
            listItem.appendChild(deleteButton);

            logListUl.appendChild(listItem);
        });
    }

    async function addLog(eventType, eventTime) {
        if (!eventTime) {
            alert('時間を入力してください。');
            return;
        }
        try {
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventType, eventTime }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to add log: ${response.statusText}`);
            }
            // const newLog = await response.json(); // Contains the added log with _id
            loadLogs(); // Refresh the list
        } catch (error) {
            console.error('Error adding log:', error);
            alert(`ログの追加に失敗しました: ${error.message}`);
        }
    }

    async function deleteLog(logId) {
        if (!confirm('この記録を削除しますか？')) {
            return;
        }
        try {
            const response = await fetch(`/api/logs/${logId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete log: ${response.statusText}`);
            }
            loadLogs(); // Refresh the list
        } catch (error) {
            console.error('Error deleting log:', error);
            alert(`ログの削除に失敗しました: ${error.message}`);
        }
    }

    // --- Initial Setup ---
    if (eventTimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        try {
            eventTimeInput.value = now.toISOString().slice(0, 16);
        } catch (e) {
            console.error("Error setting initial eventTimeInput value:", e);
            // Fallback or ensure input type is correct
            eventTimeInput.value = null; 
        }
    }

    if (logForm) {
        logForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const eventType = document.getElementById('eventType').value;
            const eventTimeValue = eventTimeInput ? eventTimeInput.value : null;
            addLog(eventType, eventTimeValue);
            // Reset time to current after submission (optional, or clear it)
            if (eventTimeInput) {
                 const now = new Date();
                 now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                 eventTimeInput.value = now.toISOString().slice(0,16);
            }
        });
    } else {
        console.error("logForm not found. Critical for app functionality.");
    }

    fetchUserStatusAndLoadApp(); // Check auth status and load initial data

    // Expose functions for testing if needed, though direct interaction is better
    // window.addLog = addLog; 
    // window.deleteLog = deleteLog;
    // window.loadLogs = loadLogs;
});


// グラフ関連の変数
let pieChart = null;
let dailyChart = null;
let hourlyChart = null;

// グラフ用のデータ処理関数
function getChartData() {
    const logs = getLogs();
    
    // おしっこ・うんちの比率データ
    const peeCount = logs.filter(log => log.type === 'pee').length;
    const poopCount = logs.filter(log => log.type === 'poop').length;
    
    // 日別データ（過去7日間）
    const dailyData = {};
    const today = new Date();
    
    // 過去7日間の日付を初期化
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = { pee: 0, poop: 0 };
    }
    
    // ログデータを日別に集計
    logs.forEach(log => {
        const logDate = new Date(log.time).toISOString().split('T')[0];
        if (dailyData[logDate]) {
            dailyData[logDate][log.type]++;
        }
    });
    
    // 時間帯別データ（0-23時）
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = { pee: 0, poop: 0 };
    }
    
    logs.forEach(log => {
        const hour = new Date(log.time).getHours();
        hourlyData[hour][log.type]++;
    });
    
    return {
        pie: { pee: peeCount, poop: poopCount },
        daily: dailyData,
        hourly: hourlyData
    };
}

// 円グラフを作成・更新
function createPieChart(data) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['おしっこ', 'うんち'],
            datasets: [{
                data: [data.pee, data.poop],
                backgroundColor: ['#87CEEB', '#DEB887'],
                borderColor: ['#4682B4', '#CD853F'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.pee + data.poop;
                            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                            return `${context.label}: ${context.parsed}回 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 日別グラフを作成・更新
function createDailyChart(data) {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    const labels = Object.keys(data).map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    const peeData = Object.values(data).map(day => day.pee);
    const poopData = Object.values(data).map(day => day.poop);
    
    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'おしっこ',
                    data: peeData,
                    backgroundColor: '#87CEEB',
                    borderColor: '#4682B4',
                    borderWidth: 1
                },
                {
                    label: 'うんち',
                    data: poopData,
                    backgroundColor: '#DEB887',
                    borderColor: '#CD853F',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// 時間帯別グラフを作成・更新
function createHourlyChart(data) {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;
    
    if (hourlyChart) {
        hourlyChart.destroy();
    }
    
    const labels = Object.keys(data).map(hour => `${hour}時`);
    const peeData = Object.values(data).map(hour => hour.pee);
    const poopData = Object.values(data).map(hour => hour.poop);
    
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'おしっこ',
                    data: peeData,
                    borderColor: '#4682B4',
                    backgroundColor: 'rgba(70, 130, 180, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'うんち',
                    data: poopData,
                    borderColor: '#CD853F',
                    backgroundColor: 'rgba(205, 133, 63, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// すべてのグラフを更新
function updateCharts() {
    const data = getChartData();
    createPieChart(data.pie);
    createDailyChart(data.daily);
    createHourlyChart(data.hourly);
}

// Make functions globally accessible for test.js
// This is a simple way; modules (ES6, CommonJS) would be better for larger apps.
window.addLog = addLog;
window.getLogs = getLogs;
window.deleteLog = deleteLog;
window.loadLogs = loadLogs;
window.renderLogs = renderLogs; // Though test.js doesn't call it directly, it's called by others
window.saveLogs = saveLogs; // If tests need to manipulate logs directly
window.updateCharts = updateCharts;
