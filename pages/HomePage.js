const BasePage = require('./BasePage');

/**
 * HomePage class represents the ParaBank home page
 * Contains all elements and actions specific to the home page
 */
class HomePage extends BasePage {
    constructor(page) {
        super(page);
        
        // Page URL
        this.url = 'https://parabank.parasoft.com/parabank';
        
        // Page elements (locators)
        this.elements = {
            logo: '.logo',
            registerLink: 'a[href*="register.htm"]',
            loginSection: '#loginPanel',
            usernameInput: 'input[name="username"]',
            passwordInput: 'input[name="password"]',
            loginButton: 'input[value="Log In"]',
            aboutLink: 'a[href*="about.htm"]',
            servicesLink: 'a[href*="services.htm"]',
            productsLink: 'a[href*="products.jsp"]',
            locationsLink: 'a[href*="contacts.jsp"]',
            adminLink: 'a[href*="admin.htm"]',
            
            // Main content
            mainContent: '#mainPanel',
            welcomeMessage: '.caption',
            
            // Footer
            footer: '#footerPanel',
            copyrightText: '.copyright'
        };
    }

    /**
     * Navigate to ParaBank home page
     */
    async open() {
        await this.navigateTo(this.url);
        await this.handleCloudflareChallenge();
        await this.waitForPageLoad();
    }

    /**
     * Click on Register link to go to registration page
     */
    async clickRegisterLink() {
        console.log('Clicking Register link...');
        await this.clickElement(this.elements.registerLink);
        await this.waitForPageLoad();
    }

    /**
     * Verify home page is loaded by checking key elements
     * @returns {Promise<boolean>} True if home page is loaded properly
     */
    async isHomePageLoaded() {
        try {
            await this.waitForElement(this.elements.logo);
            await this.waitForElement(this.elements.registerLink);
            await this.waitForElement(this.elements.loginSection);
            return true;
        } catch (error) {
            console.error('Home page not loaded properly:', error.message);
            return false;
        }
    }

    /**
     * Get the welcome message text
     * @returns {Promise<string>} Welcome message text
     */
    async getWelcomeMessage() {
        return await this.getTextContent(this.elements.welcomeMessage);
    }

    /**
     * Verify all navigation links are present
     * @returns {Promise<boolean>} True if all navigation links are visible
     */
    async areNavigationLinksVisible() {
        const links = [
            this.elements.aboutLink,
            this.elements.servicesLink,
            this.elements.productsLink,
            this.elements.locationsLink
        ];

        for (const link of links) {
            if (!(await this.isElementVisible(link))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Login with username and password
     * @param {string} username - Username for login
     * @param {string} password - Password for login
     */
    async login(username, password) {
        await this.fillField(this.elements.usernameInput, username);
        await this.fillField(this.elements.passwordInput, password);
        await this.clickElement(this.elements.loginButton);
        await this.waitForPageLoad();
    }

    /**
     * Check if user is logged in by looking for logout option
     * @returns {Promise<boolean>} True if user is logged in
     */
    async isUserLoggedIn() {
        // This would check for logout link or user account info
        // Implementation depends on ParaBank's logged-in state indicators
        return await this.isElementVisible('a[href*="logout.htm"]');
    }

    /**
     * Get page title for verification
     * @returns {Promise<string>} Page title
     */
    async getTitle() {
        return await this.getPageTitle();
    }

    /**
     * Take screenshot of home page
     */
    async takeHomePageScreenshot() {
        await this.takeScreenshot('home-page');
    }
}

module.exports = HomePage;