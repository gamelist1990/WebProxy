import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'node:path';

export interface Route {
  path: string;
  targetHost: string;
  targetPort: number;
}

export interface ProxyConfig {
  listenPort: number;
  routes: Route[];
  name?: string; // Optional project name
}

// Get current working directory
const currentDir = process.cwd();

// Possible config file paths (in priority order)
const configPaths = [
  join(currentDir, 'config.json'),    
];

// Find existing config file
let configPath: string | null = null;
for (const path of configPaths) {
  if (existsSync(path)) {
    configPath = path;
    break;
  }
}

// Default config
const defaultConfig: ProxyConfig = {
  name: "WebProxy",
  listenPort: 8080,
  routes: [
    {
      path: "/api",
      targetHost: "localhost",
      targetPort: 3000
    },
    {
      path: "/web",
      targetHost: "localhost",
      targetPort: 4000
    },
    {
      path: "/",
      targetHost: "localhost",
      targetPort: 5000
    }
  ]
};

// Load or create config
let loadedConfig: ProxyConfig;

if (!configPath) {
  // Create default config in current directory
  configPath = join(currentDir, 'config.json');
  try {
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`[CONFIG] Created default config.json at: ${configPath}`);
    loadedConfig = defaultConfig;
  } catch (error) {
    console.error(`[CONFIG] Failed to create config.json: ${error}`);
    loadedConfig = defaultConfig;
  }
} else {
  // Load existing config
  try {
    const configData = readFileSync(configPath, 'utf-8');
    loadedConfig = JSON.parse(configData);
    console.log(`[CONFIG] Loaded config from: ${configPath}`);
  } catch (error) {
    console.error(`[CONFIG] Failed to load config from ${configPath}: ${error}`);
    loadedConfig = defaultConfig;
  }
}

// Export the loaded config
export const config: ProxyConfig = loadedConfig;