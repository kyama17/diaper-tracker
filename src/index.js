// src/index.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Define patterns for proxying
    const proxyPatterns = ['/api/', '/profile', '/login', '/logout'];

    // Check if the request path matches any proxy pattern
    const shouldProxy = proxyPatterns.some(pattern => path.startsWith(pattern));

    if (shouldProxy) {
      // Ensure BACKEND_SERVICE_URL is available
      if (!env.BACKEND_SERVICE_URL) {
        return new Response('Backend service URL not configured', { status: 500 });
      }

      // Construct the new backend URL
      const backendUrl = new URL(env.BACKEND_SERVICE_URL);
      const targetUrl = new URL(path + url.search, backendUrl.origin + backendUrl.pathname.replace(/\/$/, ''));


      // Create a new request to the backend, copying relevant properties
      const backendRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual', // Important to handle redirects manually if needed
      });

      try {
        // Make the fetch request to the backend
        const backendResponse = await fetch(backendRequest);
        return backendResponse;
      } catch (error) {
        console.error('Error fetching from backend:', error);
        return new Response('Error proxying request to backend', { status: 502 }); // Bad Gateway
      }
    } else {
      // If no pattern matches, delegate to static asset serving
      // Ensure env.ASSETS is available and is a fetch handler
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        try {
          return await env.ASSETS.fetch(request);
        } catch (error) {
          console.error('Error fetching from ASSETS:', error);
          // If ASSETS.fetch fails, return a generic error or a specific message
          return new Response('Error serving static asset', { status: 500 });
        }
      } else {
        // Fallback if ASSETS.fetch is not available (e.g., misconfiguration)
        // This could be a 404 or a specific error message.
        // For now, let's return a clear message indicating the issue.
        console.log('env keys:', Object.keys(env));
        if (env.ASSETS) {
          console.log('typeof env.ASSETS:', typeof env.ASSETS);
          if (typeof env.ASSETS === 'object') {
            console.log('env.ASSETS keys:', Object.keys(env.ASSETS));
          }
        }
        console.warn('env.ASSETS.fetch is not available. Ensure [site] is configured in wrangler.toml for static assets.');
        return new Response('Static asset serving is not configured.', { status: 404 });
      }
    }
  }
};
