// Start all test servers
import { spawn } from 'child_process';

console.log('Starting test servers...');

// Start API server (port 3000)
const apiServer = spawn('bun', ['run', 'src/webserver/api-server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start Web server (port 4000)
const webServer = spawn('bun', ['run', 'src/webserver/web-server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start Default server (port 5000)
const defaultServer = spawn('bun', ['run', 'src/webserver/default-server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

console.log('All test servers started!');
console.log('API Server: http://localhost:3000');
console.log('Web Server: http://localhost:4000');
console.log('Default Server: http://localhost:5000');
console.log('');
console.log('Press Ctrl+C to stop all servers');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping all servers...');
  apiServer.kill();
  webServer.kill();
  defaultServer.kill();
  process.exit(0);
});
