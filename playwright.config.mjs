import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/ui',timeout:45000,workers:1,reporter:'list',
  use:{baseURL:'http://localhost:3069',browserName:'chromium',launchOptions:{executablePath:process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'},trace:'retain-on-failure'},
  webServer:{command:'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3069',url:'http://127.0.0.1:3069',reuseExistingServer:false,timeout:120000,
    env:{UI_TESTING:'1',APP_URL:'http://localhost:3069',SESSION_SECRET:'ui-test-only-session-secret-not-for-deployment',APPS_SCRIPT_URL:'',APPS_SCRIPT_SECRET:''}},
});
