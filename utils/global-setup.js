/**
 * Global Setup for Playwright Tests
 * Runs once before all tests start
 */

const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
  console.log('🚀 Starting ParaBank Test Suite Global Setup...');
  
  // Create test results directories
  const directories = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/html-report',
    'test-results/artifacts'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Log test configuration
  console.log('⚙️ Test Configuration:');
  console.log(`- Base URL: ${config.use?.baseURL || 'Not set'}`);
  console.log(`- Browsers: ${config.projects?.map(p => p.name).join(', ') || 'Default'}`);
  console.log(`- Parallel workers: ${config.workers || 'Auto'}`);
  console.log(`- Retries: ${config.retries || 0}`);
  
  // Environment checks
  console.log('🌐 Environment Information:');
  console.log(`- Node.js version: ${process.version}`);
  console.log(`- Platform: ${process.platform}`);
  console.log(`- CI Environment: ${process.env.CI ? 'Yes' : 'No'}`);
  console.log(`- Headless mode: ${process.env.HEADLESS !== 'false' ? 'Yes' : 'No'}`);

  // Create test execution log
  const timestamp = new Date().toISOString();
  const logContent = {
    testSuiteStart: timestamp,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      ci: !!process.env.CI,
      headless: process.env.HEADLESS !== 'false'
    },
    configuration: {
      baseURL: config.use?.baseURL,
      browsers: config.projects?.map(p => p.name),
      workers: config.workers,
      retries: config.retries
    }
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'test-results', 'test-execution-log.json'),
    JSON.stringify(logContent, null, 2)
  );

  console.log('✅ Global setup completed successfully');
}

module.exports = globalSetup;