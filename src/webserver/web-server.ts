// Web Test Server (Port 4000)
Bun.serve({
  port: 4000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/web/dashboard') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dashboard - Web Server</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
            .stats { display: flex; gap: 20px; margin-top: 20px; }
            .stat { background: #e0e0e0; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Web Server Dashboard</h1>
            <p>Running on port 4000</p>
          </div>
          <div class="stats">
            <div class="stat">
              <h3>Server Status</h3>
              <p>✅ Online</p>
            </div>
            <div class="stat">
              <h3>Response Time</h3>
              <p>&lt; 10ms</p>
            </div>
            <div class="stat">
              <h3>Timestamp</h3>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Web Server (Port 4000)</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Web Server is Running!</h1>
          <div class="info">
            <p><strong>Port:</strong> 4000</p>
            <p><strong>Path:</strong> ${url.pathname}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p><a href="/web/dashboard">View Dashboard</a></p>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  },
});

console.log('Web Test Server running on http://localhost:4000');
