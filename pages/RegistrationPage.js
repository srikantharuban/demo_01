const BasePage = require('./BasePage');

/**
 * RegistrationPage class represents the ParaBank registration page
 * Contains all elements and actions specific to user registration
 */
class RegistrationPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Registration form elements
        this.elements = {
            // Form fields
            firstNameInput: 'input[id="customer.firstName"]',
            lastNameInput: 'input[id="customer.lastName"]',
            addressInput: 'input[id="customer.address.street"]',
            cityInput: 'input[id="customer.address.city"]',
            stateInput: 'input[id="customer.address.state"]',
            zipCodeInput: 'input[id="customer.address.zipCode"]',
            phoneInput: 'input[id="customer.phoneNumber"]',
            ssnInput: 'input[id="customer.ssn"]',
            usernameInput: 'input[id="customer.username"]',
            passwordInput: 'input[id="customer.password"]',
            confirmPasswordInput: 'input[id="repeatedPassword"]',
            
            // Buttons
            registerButton: 'input[value="Register"]',
            
            // Success/Error messages
            successMessage: 'text=Your account was created successfully',
            alternateSuccessMessage: '.title:has-text("Welcome")',
            welcomeMessage: 'h1.title',
            errorMessage: '.error',
            
            // Alternative success indicators
            accountServicesSection: '#accountServices',
            usernameParagraph: 'p:has-text("Your account was created successfully")',
            
            // Page title and form
            pageTitle: '.title',
            registrationForm: '#customerForm',
            
            // Navigation
            registerTitle: 'h1:has-text("Signing up is easy!")'
        };
    }

    /**
     * Verify registration page is loaded
     * @returns {Promise<boolean>} True if registration page is loaded
     */
    async isRegistrationPageLoaded() {
        try {
            await this.waitForElement(this.elements.registrationForm);
            await this.waitForElement(this.elements.firstNameInput);
            return true;
        } catch (error) {
            console.error('Registration page not loaded properly:', error.message);
            return false;
        }
    }

    /**
     * Fill the registration form with user data
     * @param {Object} userData - User registration data
     */
    async fillRegistrationForm(userData) {
        console.log('Filling registration form with user data...');
        
        await this.fillField(this.elements.firstNameInput, userData.firstName);
        await this.fillField(this.elements.lastNameInput, userData.lastName);
        await this.fillField(this.elements.addressInput, userData.address);
        await this.fillField(this.elements.cityInput, userData.city);
        await this.fillField(this.elements.stateInput, userData.state);
        await this.fillField(this.elements.zipCodeInput, userData.zipCode);
        await this.fillField(this.elements.phoneInput, userData.phone);
        await this.fillField(this.elements.ssnInput, userData.ssn);
        await this.fillField(this.elements.usernameInput, userData.username);
        await this.fillField(this.elements.passwordInput, userData.password);
        await this.fillField(this.elements.confirmPasswordInput, userData.password);
        
        console.log('Registration form filled successfully');
    }

    /**
     * Submit the registration form
     */
    async submitRegistration() {
        console.log('Submitting registration form...');
        await this.clickElement(this.elements.registerButton);
        
        // Handle potential Cloudflare challenge after form submission
        await this.handleCloudflareChallenge();
        await this.waitForPageLoad();
    }

    /**
     * Verify successful registration with multiple fallback methods
     * @returns {Promise<boolean>} True if registration was successful
     */
    async isRegistrationSuccessful() {
        try {
            // Wait a moment for the page to process the response
            await this.page.waitForTimeout(2000);
            
            // First check if we're still on the registration page with errors
            const currentUrl = this.getCurrentUrl();
            if (currentUrl.includes('register.htm')) {
                // Check for error messages
                const errorElements = await this.page.locator('.error').count();
                if (errorElements > 0) {
                    const errorMessages = await this.page.locator('.error').allTextContents();
                    console.log('Registration failed with errors:', errorMessages);
                    return false;
                }
            }
            
            // Method 1: Look for specific success message
            if (await this.isElementVisible(this.elements.successMessage)) {
                console.log('Registration success detected: Success message found');
                return true;
            }

            // Method 2: Look for welcome message with account creation text
            if (await this.isElementVisible(this.elements.usernameParagraph)) {
                console.log('Registration success detected: Username paragraph found');
                return true;
            }

            // Method 3: Look for welcome title
            if (await this.isElementVisible(this.elements.welcomeMessage)) {
                const welcomeText = await this.getTextContent(this.elements.welcomeMessage);
                if (welcomeText.includes('Welcome')) {
                    console.log('Registration success detected: Welcome message found');
                    return true;
                }
            }

            // Method 4: Look for account services section (indicates successful login)
            if (await this.isElementVisible(this.elements.accountServicesSection)) {
                console.log('Registration success detected: Account services section found');
                return true;
            }

            // Method 5: Check URL change (successful registration usually redirects)
            if (currentUrl.includes('overview') || currentUrl.includes('account') || !currentUrl.includes('register.htm')) {
                console.log('Registration success detected: URL indicates successful registration');
                return true;
            }

            // Method 6: Check for any element that contains success-related text
            const pageContent = await this.page.content();
            const hasSuccessContent = pageContent.toLowerCase().includes('account was created') ||
                                    pageContent.toLowerCase().includes('welcome') ||
                                    pageContent.toLowerCase().includes('successful');
            
            if (hasSuccessContent) {
                console.log('Registration success detected: Page contains success content');
                return true;
            }

            console.log('Registration success not detected with any method');
            console.log('Current URL:', currentUrl);
            return false;

        } catch (error) {
            console.error('Error checking registration success:', error.message);
            return false;
        }
    }

    /**
     * Get any error messages displayed on the page
     * @returns {Promise<string[]>} Array of error messages
     */
    async getErrorMessages() {
        const errorMessages = [];
        try {
            const errorElements = await this.page.$$(this.elements.errorMessage);
            for (const element of errorElements) {
                const text = await element.textContent();
                if (text.trim()) {
                    errorMessages.push(text.trim());
                }
            }
        } catch (error) {
            console.error('Error getting error messages:', error.message);
        }
        return errorMessages;
    }

    /**
     * Clear all form fields
     */
    async clearForm() {
        const formFields = [
            this.elements.firstNameInput,
            this.elements.lastNameInput,
            this.elements.addressInput,
            this.elements.cityInput,
            this.elements.stateInput,
            this.elements.zipCodeInput,
            this.elements.phoneInput,
            this.elements.ssnInput,
            this.elements.usernameInput,
            this.elements.passwordInput,
            this.elements.confirmPasswordInput
        ];

        for (const field of formFields) {
            try {
                await this.page.fill(field, '');
            } catch (error) {
                console.log(`Could not clear field ${field}:`, error.message);
            }
        }
    }

    /**
     * Validate form field values
     * @param {Object} expectedData - Expected form data
     * @returns {Promise<boolean>} True if all fields match expected values
     */
    async validateFormData(expectedData) {
        try {
            const firstNameValue = await this.page.inputValue(this.elements.firstNameInput);
            const lastNameValue = await this.page.inputValue(this.elements.lastNameInput);
            const usernameValue = await this.page.inputValue(this.elements.usernameInput);

            return (
                firstNameValue === expectedData.firstName &&
                lastNameValue === expectedData.lastName &&
                usernameValue === expectedData.username
            );
        } catch (error) {
            console.error('Error validating form data:', error.message);
            return false;
        }
    }

    /**
     * Take screenshot of registration page
     */
    async takeRegistrationPageScreenshot() {
        await this.takeScreenshot('registration-page');
    }

    /**
     * Get registration page title
     * @returns {Promise<string>} Page title
     */
    async getRegistrationPageTitle() {
        try {
            return await this.getTextContent(this.elements.pageTitle);
        } catch (error) {
            return await this.getPageTitle();
        }
    }
}

module.exports = RegistrationPage;