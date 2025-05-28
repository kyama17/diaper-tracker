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
    } else { // Not a proxy request, try to serve static assets
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        try {
            const assetResponse = await env.ASSETS.fetch(request);
            if (assetResponse.status === 404) {
                const acceptHeader = request.headers.get('Accept');
                if (acceptHeader && acceptHeader.includes('text/html')) {
                    // This is a navigation request to a non-existent path, serve index.html for SPA routing
                    const spaRequest = new Request(new URL('/index.html', request.url).toString(), {
                        method: request.method, // Should usually be GET for SPA fallbacks
                        headers: request.headers // Pass original headers
                    });
                    return env.ASSETS.fetch(spaRequest);
                }
            }
            // If not a 404, or if it's a 404 for a non-HTML asset, return the original response
            return assetResponse;
        } catch (error) {
            console.error('Error fetching from ASSETS:', error);
            // Potentially, some errors could also be candidates for SPA fallback,
            // but typically we only do it for 404s.
            // For now, keep original error handling for other cases.
            return new Response('Error serving static asset', { status: 500 });
        }
      } else {
        // Fallback if ASSETS.fetch is not available (e.g., misconfiguration)
        console.warn('env.ASSETS.fetch is not available. Ensure [site] is configured in wrangler.toml for static assets.');
        return new Response('Static asset serving is not configured.', { status: 404 });
      }
    }
  }
};
