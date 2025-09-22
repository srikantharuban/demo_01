/**
 * Test Utilities and Helper Functions
 * Common utilities for Playwright tests
 */

const fs = require('fs');
const path = require('path');

/**
 * Test Helpers Class
 * Contains utility methods for test execution
 */
class TestHelpers {
  /**
   * Wait for a specific amount of time
   * @param {number} milliseconds - Time to wait in milliseconds
   */
  static async wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Generate random string
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  static generateRandomString(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate random number within range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static generateRandomNumber(min = 1000, max = 9999) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Format current timestamp for file names
   * @returns {string} Formatted timestamp
   */
  static getTimestamp() {
    const now = new Date();
    return now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path to create
   */
  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Save test data to JSON file
   * @param {Object} data - Data to save
   * @param {string} filename - File name
   */
  static saveTestData(data, filename) {
    const filePath = path.join(process.cwd(), 'test-results', filename);
    this.ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load test data from JSON file
   * @param {string} filename - File name to load
   * @returns {Object|null} Loaded data or null if file doesn't exist
   */
  static loadTestData(filename) {
    const filePath = path.join(process.cwd(), 'test-results', filename);
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(`Could not load test data from ${filename}:`, error.message);
      return null;
    }
  }

  /**
   * Clean up old test artifacts
   * @param {number} daysOld - Number of days old files to delete
   */
  static cleanupOldArtifacts(daysOld = 7) {
    const directories = [
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces'
    ];

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old artifact: ${file}`);
          }
        });
      }
    });
  }

  /**
   * Take screenshot with custom naming
   * @param {Object} page - Playwright page object
   * @param {string} testName - Test name for screenshot
   * @param {string} step - Test step for screenshot
   */
  static async takeStepScreenshot(page, testName, step) {
    const timestamp = this.getTimestamp();
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
    this.ensureDirectoryExists(screenshotDir);
    
    const filename = `${testName}_${step}_${timestamp}.png`;
    const screenshotPath = path.join(screenshotDir, filename);
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return screenshotPath;
  }

  /**
   * Log test step with timestamp
   * @param {string} message - Log message
   * @param {string} level - Log level (info, warn, error)
   */
  static logStep(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        this.logStep(`Attempt ${attempt} failed, retrying in ${delay}ms...`, 'warn');
        await this.wait(delay);
      }
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone is valid
   */
  static isValidPhone(phone) {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate SSN format
   * @param {string} ssn - SSN to validate
   * @returns {boolean} True if SSN is valid format
   */
  static isValidSSN(ssn) {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(ssn);
  }

  /**
   * Generate test report summary
   * @param {Array} testResults - Array of test results
   * @returns {Object} Test summary
   */
  static generateTestSummary(testResults) {
    const summary = {
      total: testResults.length,
      passed: testResults.filter(r => r.status === 'passed').length,
      failed: testResults.filter(r => r.status === 'failed').length,
      skipped: testResults.filter(r => r.status === 'skipped').length,
      timestamp: new Date().toISOString()
    };
    
    summary.passRate = summary.total > 0 ? 
      Math.round((summary.passed / summary.total) * 100) : 0;
    
    return summary;
  }
}

module.exports = TestHelpers;