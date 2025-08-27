// API Test Server (Port 3000)
Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/users') {
      return Response.json({
        users: [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' }
        ]
      });
    }

    if (url.pathname === '/api/status') {
      return Response.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'API Server (Port 3000)'
      });
    }

    return Response.json({
      message: 'API Server is running on port 3000',
      endpoints: ['/api/users', '/api/status'],
      path: url.pathname
    });
  },
});

console.log('API Test Server running on http://localhost:3000');
