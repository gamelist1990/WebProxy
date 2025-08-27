// Default Test Server (Port 5000)
Bun.serve({
  port: 5000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({
        status: 'healthy',
        server: 'Default Server (Port 5000)',
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/info') {
      return new Response(`
Default Server Information
========================
Port: 5000
Status: Running
Time: ${new Date().toLocaleString()}
Path: ${url.pathname}
Query: ${url.search}

This is the default server for the WebProxy test.
      `, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response(`
🌟 Default Test Server 🌟

Hello! This is the default server running on port 5000.

Current time: ${new Date().toLocaleString()}
Requested path: ${url.pathname}
Requested URL: ${request.url}

Available endpoints:
- /health (JSON status)
- /info (server information)
- Any other path (this message)

This server is part of the WebProxy testing setup.
    `, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },
});

console.log('Default Test Server running on http://localhost:5000');
