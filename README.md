# WebProxy

A simple HTTP proxy server built with Bun that forwards client requests to multiple backend servers based on URL paths, preserving the client's real IP address.

## Features

- HTTP proxy server with path-based routing
- Preserves client IP in `X-Forwarded-For` and `X-Real-IP` headers
- Configurable multiple target hosts and ports
- Built with Bun for high performance
- Only proxy port needs to be open, backend servers remain internal
- **Request logging**: Displays client IP, request path, routing information, and response status

## Request Logging

The proxy server logs all incoming requests with the following format:

```
[2025-08-27T10:30:00.000Z] 192.168.1.100 - GET /api/users → /api (localhost:3000) - 200 OK
[2025-08-27T10:30:05.000Z] 192.168.1.100 - POST /web/data → /web (localhost:4000) - 201 Created
[2025-08-27T10:30:10.000Z] 192.168.1.100 - GET /health → / (localhost:5000) - 503 Service Unavailable
```

Log format: `[timestamp] client_ip - method url → route (target_host:target_port) - status_code status_text`

## Configuration

Edit `src/settings/config.json` to configure the proxy:

```json
{
  "listenPort": 8080,
  "routes": [
    {
      "path": "/api",
      "targetHost": "localhost",
      "targetPort": 3000
    },
    {
      "path": "/web",
      "targetHost": "localhost",
      "targetPort": 4000
    },
    {
      "path": "/",
      "targetHost": "localhost",
      "targetPort": 5000
    }
  ]
}
```

The proxy will automatically load the configuration from this JSON file.

## Running Test Servers

The project includes test servers that you can use to test the proxy functionality. These servers run on the configured backend ports.

### Start All Test Servers

```bash
bun run start:servers
# or
npm run start:servers
```

This will start:
- API Server on port 3000 (JSON responses)
- Web Server on port 4000 (HTML responses)
- Default Server on port 5000 (plain text responses)

### Start Individual Servers

```bash
bun run start:api      # Start API server (port 3000)
bun run start:web      # Start Web server (port 4000)
bun run start:default  # Start Default server (port 5000)
```

### Test Endpoints

Once the test servers are running, you can test the proxy:

- `http://localhost:8080/api/users` → API server (JSON)
- `http://localhost:8080/api/status` → API server (JSON)
- `http://localhost:8080/web/dashboard` → Web server (HTML dashboard)
- `http://localhost:8080/health` → Default server (JSON)
- `http://localhost:8080/info` → Default server (plain text)
- `http://localhost:8080/` → Default server (welcome message)

## Usage

1. Start your backend servers on the configured target ports
2. Run the proxy: `bun run src/index.ts`
3. Send requests to `http://localhost:8080`
4. The proxy will route them to the appropriate backend server based on the URL path
5. Only the proxy port (8080) needs to be open externally; backend servers can remain internal without port exposure

This project was created using `bun init` in bun v1.1.36. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
