/**
 * BasePage class provides common functionality for all page objects
 * This includes common actions like navigation, waiting, and element interactions
 */
class BasePage {
    constructor(page) {
        this.page = page;
        this.timeout = 30000; // 30 seconds default timeout
    }

    /**
     * Navigate to a specific URL
     * @param {string} url - The URL to navigate to
     */
    async navigateTo(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    /**
     * Wait for an element to be visible
     * @param {string} selector - The element selector
     * @param {number} timeout - Custom timeout (optional)
     */
    async waitForElement(selector, timeout = this.timeout) {
        await this.page.waitForSelector(selector, { 
            state: 'visible', 
            timeout: timeout 
        });
    }

    /**
     * Click an element with retry mechanism
     * @param {string} selector - The element selector
     */
    async clickElement(selector) {
        await this.waitForElement(selector);
        await this.page.click(selector);
    }

    /**
     * Fill a form field
     * @param {string} selector - The input field selector
     * @param {string} value - The value to fill
     */
    async fillField(selector, value) {
        await this.waitForElement(selector);
        await this.page.fill(selector, value);
    }

    /**
     * Get text content of an element
     * @param {string} selector - The element selector
     * @returns {Promise<string>} The text content
     */
    async getTextContent(selector) {
        await this.waitForElement(selector);
        return await this.page.textContent(selector);
    }

    /**
     * Check if an element is visible
     * @param {string} selector - The element selector
     * @returns {Promise<boolean>} True if visible, false otherwise
     */
    async isElementVisible(selector) {
        try {
            await this.page.waitForSelector(selector, { 
                state: 'visible', 
                timeout: 5000 
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Take a screenshot
     * @param {string} name - The screenshot name
     */
    async takeScreenshot(name) {
        await this.page.screenshot({ 
            path: `test-results/screenshots/${name}-${Date.now()}.png`,
            fullPage: true
        });
    }

    /**
     * Wait for page to load completely
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Handle Cloudflare challenge if present
     */
    async handleCloudflareChallenge() {
        try {
            // Check for Cloudflare challenge
            const cloudflareChallenge = await this.isElementVisible('.cf-challenge-container');
            if (cloudflareChallenge) {
                console.log('Cloudflare challenge detected, waiting for completion...');
                await this.page.waitForSelector('.cf-challenge-container', { 
                    state: 'hidden', 
                    timeout: 30000 
                });
                console.log('Cloudflare challenge completed');
            }
        } catch (error) {
            console.log('No Cloudflare challenge or challenge handling failed:', error.message);
        }
    }

    /**
     * Get current page URL
     * @returns {string} Current URL
     */
    getCurrentUrl() {
        return this.page.url();
    }

    /**
     * Get page title
     * @returns {Promise<string>} Page title
     */
    async getPageTitle() {
        return await this.page.title();
    }
}

module.exports = BasePage;