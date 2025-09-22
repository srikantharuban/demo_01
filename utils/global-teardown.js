/**
 * Global Teardown for Playwright Tests
 * Runs once after all tests complete
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting ParaBank Test Suite Global Teardown...');

  try {
    // Read test execution log
    const logPath = path.join(process.cwd(), 'test-results', 'test-execution-log.json');
    let logContent = {};
    
    if (fs.existsSync(logPath)) {
      logContent = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    // Update log with completion time
    const timestamp = new Date().toISOString();
    logContent.testSuiteEnd = timestamp;
    
    if (logContent.testSuiteStart) {
      const startTime = new Date(logContent.testSuiteStart);
      const endTime = new Date(timestamp);
      const durationMs = endTime - startTime;
      logContent.totalDuration = {
        milliseconds: durationMs,
        seconds: Math.round(durationMs / 1000),
        formatted: formatDuration(durationMs)
      };
    }

    // Count test result files
    const resultsDir = path.join(process.cwd(), 'test-results');
    const artifacts = {
      screenshots: countFiles(path.join(resultsDir, 'screenshots'), '.png'),
      videos: countFiles(path.join(resultsDir, 'videos'), '.webm'),
      traces: countFiles(path.join(resultsDir, 'traces'), '.zip'),
      reports: fs.existsSync(path.join(resultsDir, 'html-report')) ? 1 : 0
    };
    
    logContent.artifacts = artifacts;

    // Write final log
    fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2));

    // Display summary
    console.log('📊 Test Execution Summary:');
    console.log(`- Start time: ${logContent.testSuiteStart || 'Unknown'}`);
    console.log(`- End time: ${timestamp}`);
    console.log(`- Total duration: ${logContent.totalDuration?.formatted || 'Unknown'}`);
    console.log(`- Screenshots captured: ${artifacts.screenshots}`);
    console.log(`- Videos recorded: ${artifacts.videos}`);
    console.log(`- Traces collected: ${artifacts.traces}`);
    console.log(`- HTML reports generated: ${artifacts.reports}`);

    // Generate simple summary report
    const summaryPath = path.join(resultsDir, 'execution-summary.txt');
    const summaryContent = `
ParaBank Test Execution Summary
==============================
Test Suite: Customer Registration Tests
Start Time: ${logContent.testSuiteStart || 'Unknown'}
End Time: ${timestamp}
Duration: ${logContent.totalDuration?.formatted || 'Unknown'}

Artifacts Generated:
- Screenshots: ${artifacts.screenshots}
- Videos: ${artifacts.videos}
- Traces: ${artifacts.traces}
- HTML Reports: ${artifacts.reports}

Environment:
- Node.js: ${logContent.environment?.nodeVersion || process.version}
- Platform: ${logContent.environment?.platform || process.platform}
- CI Mode: ${logContent.environment?.ci ? 'Yes' : 'No'}
- Headless: ${logContent.environment?.headless ? 'Yes' : 'No'}

Configuration:
- Base URL: ${logContent.configuration?.baseURL || 'Not set'}
- Browsers: ${logContent.configuration?.browsers?.join(', ') || 'Default'}
- Workers: ${logContent.configuration?.workers || 'Auto'}
- Retries: ${logContent.configuration?.retries || 0}
`;

    fs.writeFileSync(summaryPath, summaryContent);
    
    console.log(`📄 Execution summary saved to: ${summaryPath}`);
    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Error during global teardown:', error.message);
  }
}

/**
 * Count files with specific extension in a directory
 */
function countFiles(directory, extension) {
  try {
    if (!fs.existsSync(directory)) {
      return 0;
    }
    
    const files = fs.readdirSync(directory);
    return files.filter(file => file.endsWith(extension)).length;
  } catch (error) {
    return 0;
  }
}

/**
 * Format duration in a human-readable format
 */
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = globalTeardown;