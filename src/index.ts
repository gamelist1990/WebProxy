import { config } from './Module/config';

Bun.serve({
  port: config.listenPort,
  async fetch(request, server) {
    const url = new URL(request.url);
    const timestamp = new Date().toISOString();

    // Enhanced client IP detection
    let clientIP = 'unknown';

    // Try multiple methods to get client IP
    const forwardedFor = request.headers.get('X-Forwarded-For');
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (request.headers.get('CF-Connecting-IP')) {
      clientIP = request.headers.get('CF-Connecting-IP')!;
    } else if (request.headers.get('X-Real-IP')) {
      clientIP = request.headers.get('X-Real-IP')!;
    } else if (request.headers.get('X-Client-IP')) {
      clientIP = request.headers.get('X-Client-IP')!;
    } else if (request.headers.get('Forwarded')) {
      // Parse Forwarded header: Forwarded: for=192.168.1.1;by=proxy
      const forwarded = request.headers.get('Forwarded')!;
      const forMatch = forwarded.match(/for=([^;]+)/);
      if (forMatch) {
        clientIP = forMatch[1].replace(/^"|"$/g, ''); // Remove quotes if present
      }
    } else if (request.headers.get('X-Forwarded-Host')) {
      clientIP = request.headers.get('X-Forwarded-Host')!;
    }

    // Try Bun-specific methods
    if (clientIP === 'unknown') {
      try {
        // Try request.ip if available
        const reqWithIP = (request as any);
        if (reqWithIP.ip && typeof reqWithIP.ip === 'string') {
          clientIP = reqWithIP.ip;
        } else if (reqWithIP.ip && typeof reqWithIP.ip === 'function') {
          // If it's a function, call it to get the IP
          const ipResult = reqWithIP.ip();
          if (typeof ipResult === 'string') {
            clientIP = ipResult;
          }
        }
      } catch (e) {
        // Ignore errors from IP detection
      }
    }

    // If still unknown, try to get from server context
    if (clientIP === 'unknown' && server) {
      try {
        const serverInfo = (server as any);
        if (serverInfo.requestIP) {
          if (typeof serverInfo.requestIP === 'string') {
            clientIP = serverInfo.requestIP;
          } else if (typeof serverInfo.requestIP === 'function') {
            // If it's a function, call it to get the IP
            const ipResult = serverInfo.requestIP();
            if (typeof ipResult === 'string') {
              clientIP = ipResult;
            }
          }
        }
      } catch (e) {
        // Ignore errors from server context
      }
    }

    // Final fallback: Use ipinfo.io to get client IP information
    if (clientIP === 'unknown') {
      try {
        // Use ipinfo.io to get client information
        const ipInfoResponse = await fetch('https://ipinfo.io/json', {
          headers: {
            'User-Agent': 'WebProxy/1.0'
          }
        });

        if (ipInfoResponse.ok) {
          const ipInfo = await ipInfoResponse.json();
          if (ipInfo.ip) {
            clientIP = ipInfo.ip;
            console.log(`[IPINFO] Retrieved IP from ipinfo.io: ${clientIP}`);
          }
        }
      } catch (e) {
        console.log(`[IPINFO] Failed to retrieve IP from ipinfo.io: ${e}`);
      }
    }

    // Find matching route
    let targetRoute = config.routes.find(route => url.pathname.startsWith(route.path));
    if (!targetRoute) {
      targetRoute = config.routes.find(route => route.path === '/'); // default route
    }
    if (!targetRoute) {
      console.log(`[${timestamp}] ${clientIP} - ${request.method} ${request.url} - No route found (404)`);
      return new Response('No route found', { status: 404 });
    }

    const targetUrl = `http://${targetRoute.targetHost}:${targetRoute.targetPort}${url.pathname}${url.search}`;

    // Log the request
    console.log(`[${timestamp}] ${clientIP} - ${request.method} ${request.url} → ${targetRoute.path} (${targetRoute.targetHost}:${targetRoute.targetPort})`);

    // Create new headers with X-Forwarded-For
    const headers = new Headers(request.headers);

    // Only set IP headers if we have a valid string IP
    if (clientIP && typeof clientIP === 'string' && clientIP !== 'unknown') {
      headers.set('X-Forwarded-For', clientIP);
      headers.set('X-Real-IP', clientIP);
    }

    // Remove host header to avoid issues
    headers.delete('host');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      // Log successful response
      console.log(`[${timestamp}] ${clientIP} - ${request.method} ${request.url} → ${targetRoute.path} (${targetRoute.targetHost}:${targetRoute.targetPort}) - ${response.status} ${response.statusText}`);

      // Return the response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error(`[${timestamp}] ${clientIP} - ${request.method} ${request.url} → ${targetRoute.path} (${targetRoute.targetHost}:${targetRoute.targetPort}) - ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Check error type and provide detailed message
      let errorMessage = 'Proxy Error';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('ConnectionRefused') || error.message.includes('ECONNREFUSED')) {
          errorMessage = `バックエンドサーバーに接続できません: ${targetRoute.targetHost}:${targetRoute.targetPort} が起動していないか、アクセスできません。`;
          statusCode = 503; // Service Unavailable
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = `ホストが見つかりません: ${targetRoute.targetHost}`;
          statusCode = 502; // Bad Gateway
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          errorMessage = `接続タイムアウト: ${targetRoute.targetHost}:${targetRoute.targetPort}`;
          statusCode = 504; // Gateway Timeout
        } else {
          errorMessage = `プロキシエラー: ${error.message}`;
        }
      }

      return new Response(errorMessage, { status: statusCode });
    }
  },
});

console.log(`Proxy server running on http://localhost:${config.listenPort}`);
config.routes.forEach(route => {
  console.log(`Routing ${route.path} to http://${route.targetHost}:${route.targetPort}`);
});