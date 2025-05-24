// script.js
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
