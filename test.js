// test.js

// Helper function to assert equality (basic version)
function assert(condition, message) {
    if (!condition) {
        console.error("Assertion Failed: " + (message || ""));
        // You could throw an error here to stop execution on failure
        // throw new Error("Assertion Failed: " + (message || ""));
    } else {
        console.log("Assertion Passed: " + (message || ""));
    }
}

// Ensure this script has access to functions from script.js
// This might require running these tests in an environment where script.js is loaded,
// like the browser console after both scripts are included in index.html.
// For the purpose of this subtask, assume functions like addLog, getLogs, deleteLog are available.

function testAddLogAndGetLogs() {
    console.log("--- Running testAddLogAndGetLogs ---");
    localStorage.clear(); // Clear storage for a clean test

    // Test initial state
    let logs = getLogs();
    assert(logs.length === 0, "Initial logs should be empty");

    // Add first log
    const log1 = { type: "pee", time: new Date().toISOString().slice(0, 16), id: Date.now() };
    // Simulate adding a log by directly manipulating localStorage and then rendering
    // This is because addLog itself calls renderLogs and interacts with the DOM
    // For pure logic testing, we might need to refactor script.js to separate logic from DOM updates
    // Or, ensure the DOM elements script.js expects are present if running in a test environment like Karma/Jasmine
    
    // For now, let's adapt the test to how script.js is structured,
    // assuming addLog can be called if the DOM structure from index.html is present.
    // If running this in browser console with index.html loaded, it should work.
    
    // To make tests more independent of DOM, script.js would need refactoring.
    // Let's proceed by calling functions as they are, assuming DOM context.
    // If `document.getElementById` calls fail, these tests would fail.

    // We need to ensure the DOM is ready or mock the parts of script.js that interact with the DOM
    // For this task, we'll assume the tests are run in the browser with index.html loaded.

    // Test adding a pee log
    const time1 = new Date(new Date().getTime() - 100000).toISOString().slice(0,16);
    addLog("pee", time1);
    logs = getLogs();
    assert(logs.length === 1, "Logs should have 1 entry after first addLog");
    assert(logs[0].type === "pee", "First log type should be pee");
    assert(logs[0].time === time1, "First log time should match");

    // Test adding a poop log
    const time2 = new Date().toISOString().slice(0,16);
    addLog("poop", time2);
    logs = getLogs();
    assert(logs.length === 2, "Logs should have 2 entries after second addLog");
    // Logs are sorted by time descending in renderLogs, which getLogs then retrieves.
    // So the latest log (time2) should be first.
    assert(logs[0].type === "poop", "Second log type should be poop (was added last, appears first)");
    assert(logs[0].time === time2, "Second log time should match");
    console.log("--- testAddLogAndGetLogs Complete ---");
}

function testDeleteLog() {
    console.log("--- Running testDeleteLog ---");
    localStorage.clear();

    // Add some logs
    const time1 = new Date(new Date().getTime() - 200000).toISOString().slice(0,16);
    const time2 = new Date(new Date().getTime() - 100000).toISOString().slice(0,16);
    const time3 = new Date().toISOString().slice(0,16);

    addLog("pee", time1); // Will have some ID
    addLog("poop", time2); // Will have some ID
    addLog("pee", time3);  // Will have some ID

    let logs = getLogs();
    assert(logs.length === 3, "Should have 3 logs initially for delete test");

    const logToDelete = logs[1]; // Delete the middle log (poop, time2)
    deleteLog(logToDelete.id);

    logs = getLogs();
    assert(logs.length === 2, "Should have 2 logs after deletion");
    const remainingIds = logs.map(log => log.id);
    assert(!remainingIds.includes(logToDelete.id), "Deleted log ID should not be present");
    assert(logs.find(log => log.time === time1), "Log 1 should still be present");
    assert(logs.find(log => log.time === time3), "Log 3 should still be present");
    console.log("--- testDeleteLog Complete ---");
}

function testLocalStoragePersistence() {
    console.log("--- Running testLocalStoragePersistence ---");
    localStorage.clear();

    const time1 = new Date().toISOString().slice(0,16);
    addLog("poop", time1);
    let logs = getLogs();
    const originalLogId = logs[0].id;

    // Simulate reload by re-calling loadLogs (which calls renderLogs, which calls getLogs)
    // In a real scenario, this would be a page refresh, and DOMContentLoaded would re-run loadLogs.
    // Here, calling loadLogs() should suffice to prove data is read from localStorage via getLogs().
    loadLogs(); // This will re-render from localStorage

    logs = getLogs();
    assert(logs.length === 1, "Should have 1 log after simulated reload");
    assert(logs[0].type === "poop", "Log type should be preserved");
    assert(logs[0].time === time1, "Log time should be preserved");
    assert(logs[0].id === originalLogId, "Log ID should be preserved");
    console.log("--- testLocalStoragePersistence Complete ---");
}

function runAllTests() {
    console.log("Starting all tests...");
    // DOM must be ready for these tests to pass as they call functions that interact with DOM
    if (document.readyState === "loading") {
        console.warn("DOM not fully loaded. Tests might fail. Run after DOMContentLoaded.");
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM loaded, re-running tests.");
            testAddLogAndGetLogs();
            testDeleteLog();
            testLocalStoragePersistence();
            console.log("All tests complete.");
        });
    } else {
        testAddLogAndGetLogs();
        testDeleteLog();
        testLocalStoragePersistence();
        console.log("All tests complete.");
    }
}

// To run tests:
// 1. Include this file in index.html: <script src="test.js"></script> (after script.js)
// 2. Open index.html in the browser.
// 3. Open the developer console.
// 4. Type `runAllTests()` and press Enter.
// Note: The `addLog` and `deleteLog` functions in script.js call `renderLogs`, which updates the UI.
// These tests will also cause UI updates.
