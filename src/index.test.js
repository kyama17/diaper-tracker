import worker from './index.js';

// --- Simple Assertion Function ---
function assert(condition, message) {
  if (!condition) {
    console.error('Assertion Failed:', message);
    throw new Error(message || "Assertion failed");
  }
  console.log('Assertion Passed:', message);
}

// --- Mocks ---
let lastFetchCall = { url: null, options: null, called: false };
let fetchShouldThrowError = false;
let fetchErrorToThrow = new Error("Mock fetch failed");

global.fetch = async (url, options) => {
  console.log(`Mock global.fetch called with URL: ${url}`, options);
  lastFetchCall = { url: url.toString(), options, called: true };
  if (fetchShouldThrowError) {
    throw fetchErrorToThrow;
  }
  return new Response("mocked backend response", { status: 200, headers: { 'X-Mock-Backend': 'true'} });
};

let lastAssetsFetchCall = { request: null, called: false };
let assetsFetchShouldThrowError = false;
let assetsErrorToThrow = new Error("Mock ASSETS.fetch failed");

const mockEnvBase = {
  ASSETS: {
    fetch: async (request) => {
      console.log(`Mock ASSETS.fetch called with URL: ${request.url}`);
      lastAssetsFetchCall = { request, called: true };
      if (assetsFetchShouldThrowError) {
        throw assetsErrorToThrow;
      }
      return new Response("mocked static asset", { status: 200, headers: { 'X-Mock-Asset': 'true'} });
    }
  },
  BACKEND_SERVICE_URL: 'http://mockbackend.com'
};

// --- Test Suite ---
async function runTests() {
  console.log("--- Starting Worker Tests ---");

  // Helper to reset mocks before each test
  function resetMocks() {
    lastFetchCall = { url: null, options: null, called: false };
    fetchShouldThrowError = false;
    fetchErrorToThrow = new Error("Mock fetch failed");

    lastAssetsFetchCall = { request: null, called: false };
    assetsFetchShouldThrowError = false;
    assetsErrorToThrow = new Error("Mock ASSETS.fetch failed");
    
    // Restore base mockEnv, specific tests can modify it
    mockEnv = JSON.parse(JSON.stringify(mockEnvBase)); // Deep copy for modification safety
    mockEnv.ASSETS = mockEnvBase.ASSETS; // ASSETS.fetch is a function, so re-assign
  }

  let mockEnv; // To be set by resetMocks()

  // Test Case 1: Proxying API requests
  resetMocks();
  console.log("\nTest Case 1: Proxying API requests (/api/data)");
  const apiRequest = new Request('https://example.com/api/data');
  await worker.fetch(apiRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called for API route");
  assert(lastFetchCall.url === 'http://mockbackend.com/api/data', `Fetch called with correct API URL. Expected: http://mockbackend.com/api/data, Got: ${lastFetchCall.url}`);
  assert(lastFetchCall.options.method === 'GET', "Fetch called with correct method (GET)");

  // Test Case 2: Proxying auth requests (/login)
  resetMocks();
  console.log("\nTest Case 2: Proxying auth requests (/login)");
  const loginRequest = new Request('https://example.com/login');
  await worker.fetch(loginRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called for /login route");
  assert(lastFetchCall.url === 'http://mockbackend.com/login', `Fetch called with correct /login URL. Expected: http://mockbackend.com/login, Got: ${lastFetchCall.url}`);

  // Test Case 3: Proxying auth requests (/profile)
  resetMocks();
  console.log("\nTest Case 3: Proxying auth requests (/profile)");
  const profileRequest = new Request('https://example.com/profile');
  await worker.fetch(profileRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called for /profile route");
  assert(lastFetchCall.url === 'http://mockbackend.com/profile', `Fetch called with correct /profile URL. Expected: http://mockbackend.com/profile, Got: ${lastFetchCall.url}`);

  // Test Case 4: Proxying requests with query parameters
  resetMocks();
  console.log("\nTest Case 4: Proxying requests with query parameters (/api/search?term=test)");
  const queryRequest = new Request('https://example.com/api/search?term=test&lang=en');
  await worker.fetch(queryRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called for API route with query");
  assert(lastFetchCall.url === 'http://mockbackend.com/api/search?term=test&lang=en', `Fetch called with correct URL and query. Expected: http://mockbackend.com/api/search?term=test&lang=en, Got: ${lastFetchCall.url}`);

  // Test Case 5: Forwarding request method, headers, and body
  resetMocks();
  console.log("\nTest Case 5: Forwarding POST request method, headers, and body (/api/submit)");
  const postData = JSON.stringify({ message: "hello" });
  const postRequest = new Request('https://example.com/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'TestValue' },
    body: postData
  });
  await worker.fetch(postRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called for POST API route");
  assert(lastFetchCall.url === 'http://mockbackend.com/api/submit', "Fetch called with correct POST URL");
  assert(lastFetchCall.options.method === 'POST', "Fetch called with correct method (POST)");
  assert(lastFetchCall.options.headers.get('Content-Type') === 'application/json', "Fetch called with correct Content-Type header");
  assert(lastFetchCall.options.headers.get('X-Custom-Header') === 'TestValue', "Fetch called with custom header");
  // Note: Comparing body directly can be tricky with streams. Worker copies it.
  // For this simple mock, we assume the worker passes it through correctly.
  // If direct body comparison is needed, the mock fetch would need to read the stream.
  assert(lastFetchCall.options.body === postData, "Fetch called with correct body");


  // Test Case 6: Serving static assets
  resetMocks();
  console.log("\nTest Case 6: Serving static assets (/index.html)");
  const staticRequest = new Request('https://example.com/index.html');
  await worker.fetch(staticRequest, mockEnv, {});
  assert(lastAssetsFetchCall.called, "env.ASSETS.fetch should be called for static route");
  assert(lastAssetsFetchCall.request.url === 'https://example.com/index.html', "ASSETS.fetch called with correct request URL");
  assert(!lastFetchCall.called, "global.fetch should NOT be called for static route");

  // Test Case 7: Handling missing BACKEND_SERVICE_URL for API routes
  resetMocks();
  mockEnv.BACKEND_SERVICE_URL = null;
  console.log("\nTest Case 7: Handling missing BACKEND_SERVICE_URL for API routes (/api/missing_backend)");
  const missingBackendRequest = new Request('https://example.com/api/missing_backend');
  const responseMissingBackend = await worker.fetch(missingBackendRequest, mockEnv, {});
  assert(responseMissingBackend.status === 500, `Response status should be 500 for missing backend URL. Got: ${responseMissingBackend.status}`);
  const responseBodyMissing = await responseMissingBackend.text();
  assert(responseBodyMissing === 'Backend service URL not configured', "Response body indicates missing backend URL config");
  assert(!lastFetchCall.called, "global.fetch should NOT be called if BACKEND_SERVICE_URL is missing");

  // Test Case 8: Handling errors from backend fetch
  resetMocks();
  fetchShouldThrowError = true;
  fetchErrorToThrow = new Error("Network failure");
  console.log("\nTest Case 8: Handling errors from backend fetch (/api/fetch_error)");
  const backendErrorRequest = new Request('https://example.com/api/fetch_error');
  const responseBackendError = await worker.fetch(backendErrorRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called even if it throws");
  assert(responseBackendError.status === 502, `Response status should be 502 for backend fetch error. Got: ${responseBackendError.status}`);
  const responseBodyBackendError = await responseBackendError.text();
  assert(responseBodyBackendError === 'Error proxying request to backend', "Response body indicates backend proxy error");

  // Test Case 9: Handling errors from ASSETS.fetch
  resetMocks();
  assetsFetchShouldThrowError = true;
  assetsErrorToThrow = new Error("Asset loading failed");
  console.log("\nTest Case 9: Handling errors from ASSETS.fetch (/static_error.txt)");
  const assetErrorRequest = new Request('https://example.com/static_error.txt');
  const responseAssetError = await worker.fetch(assetErrorRequest, mockEnv, {});
  assert(lastAssetsFetchCall.called, "ASSETS.fetch should be called even if it throws");
  assert(responseAssetError.status === 500, `Response status should be 500 for ASSETS.fetch error. Got: ${responseAssetError.status}`);
  const responseBodyAssetError = await responseAssetError.text();
  assert(responseBodyAssetError === 'Error serving static asset', "Response body indicates asset serving error");

  // Test Case 10: Handling missing ASSETS.fetch configuration
  resetMocks();
  mockEnv.ASSETS = null; // Simulate ASSETS not being configured
  console.log("\nTest Case 10: Handling missing ASSETS.fetch configuration (/no_assets_config.html)");
  const noAssetsConfigRequest = new Request('https://example.com/no_assets_config.html');
  const responseNoAssetsConfig = await worker.fetch(noAssetsConfigRequest, mockEnv, {});
  assert(responseNoAssetsConfig.status === 404, `Response status should be 404 if ASSETS.fetch is not configured. Got: ${responseNoAssetsConfig.status}`);
  const responseBodyNoAssets = await responseNoAssetsConfig.text();
  assert(responseBodyNoAssets === 'Static asset serving is not configured.', "Response body indicates ASSETS not configured");


  // Test Case 11: Backend URL construction with trailing slash in BACKEND_SERVICE_URL
  resetMocks();
  mockEnv.BACKEND_SERVICE_URL = 'http://mockbackend.com/v1/'; // Trailing slash
  console.log("\nTest Case 11: Backend URL construction with trailing slash in BACKEND_SERVICE_URL (/api/path)");
  const trailingSlashApiRequest = new Request('https://example.com/api/path');
  await worker.fetch(trailingSlashApiRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called");
  assert(lastFetchCall.url === 'http://mockbackend.com/v1/api/path', `Fetch URL with trailing slash. Expected: http://mockbackend.com/v1/api/path, Got: ${lastFetchCall.url}`);

  // Test Case 12: Backend URL construction without trailing slash in BACKEND_SERVICE_URL and no leading slash in path (though worker adds it)
  resetMocks();
  mockEnv.BACKEND_SERVICE_URL = 'http://mockbackend.com/v1'; // No trailing slash
  console.log("\nTest Case 12: Backend URL construction without trailing slash in BACKEND_SERVICE_URL (/api/path)");
  // URL path always has a leading slash from new URL(request.url).pathname
  const noTrailingSlashApiRequest = new Request('https://example.com/api/path');
  await worker.fetch(noTrailingSlashApiRequest, mockEnv, {});
  assert(lastFetchCall.called, "global.fetch should be called");
  assert(lastFetchCall.url === 'http://mockbackend.com/v1/api/path', `Fetch URL no trailing slash. Expected: http://mockbackend.com/v1/api/path, Got: ${lastFetchCall.url}`);


  console.log("\n--- All Tests Completed ---");
}

runTests().catch(e => {
  console.error("--- Test Suite Failed ---");
  console.error(e);
  process.exitCode = 1; // Indicate failure for CI environments
});
