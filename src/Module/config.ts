import { readFileSync } from 'fs';
import { join } from 'path';

export interface Route {
  path: string;
  targetHost: string;
  targetPort: number;
}

export interface ProxyConfig {
  listenPort: number;
  routes: Route[];
}

// Load config from JSON file
const configPath = join(__dirname, '../settings/config.json');
const configData = readFileSync(configPath, 'utf-8');
export const config: ProxyConfig = JSON.parse(configData);