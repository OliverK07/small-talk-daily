/**
 * Cloudflare Pages Function: Proxy /api/* to Worker
 * 
 * This function proxies all /api/* requests to the Worker API server-side,
 * so the browser doesn't need to handle HMAC signing.
 */

interface Env {
  WORKER_API_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Default Worker API URL
  const workerApiUrl = env.WORKER_API_URL || 'https://small-talk-daily-api.thusnoy.workers.dev';
  
  // Build target URL by preserving the path and query string
  const targetUrl = `${workerApiUrl}${url.pathname}${url.search}`;
  
  try {
    // Forward the request to the Worker
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Small-Talk-Daily-Pages-Proxy/1.0',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    // Clone the response and add CORS headers if needed
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'API proxy failed' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
