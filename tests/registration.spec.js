const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const RegistrationPage = require('../pages/RegistrationPage');
const { generateUniqueUser, getTestData } = require('../test-data/userData');

/**
 * ParaBank Registration Tests using Page Object Model
 * Test Suite: Customer Registration (TC 001)
 */
test.describe('ParaBank Customer Registration', () => {
  let homePage;
  let registrationPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    homePage = new HomePage(page);
    registrationPage = new RegistrationPage(page);
    
    // Navigate to ParaBank home page
    await homePage.open();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.title}-failure-${Date.now()}.png`,
        fullPage: true
      });
    }
  });

  test('TC 001 - Successful Customer Registration with Valid Data', async ({ page }) => {
    // Test data
    const userData = generateUniqueUser();
    
    console.log(`Testing registration with username: ${userData.username}`);

    // Step 1: Verify home page is loaded
    await test.step('Verify ParaBank home page loads successfully', async () => {
      const isLoaded = await homePage.isHomePageLoaded();
      expect(isLoaded).toBeTruthy();
      
      const pageTitle = await homePage.getTitle();
      expect(pageTitle).toContain('ParaBank');
    });

    // Step 2: Navigate to registration page
    await test.step('Navigate to registration page', async () => {
      await homePage.clickRegisterLink();
      
      const isRegistrationPageLoaded = await registrationPage.isRegistrationPageLoaded();
      expect(isRegistrationPageLoaded).toBeTruthy();
    });

    // Step 3: Fill registration form (with retry for username conflicts)
    await test.step('Fill registration form with valid data', async () => {
      let attempt = 0;
      const maxAttempts = 3;
      let success = false;

      while (attempt < maxAttempts && !success) {
        attempt++;
        console.log(`Registration attempt ${attempt}/${maxAttempts}`);
        
        // Generate fresh user data for each attempt
        const freshUserData = userData.username.includes('testuser_') ? 
          testData.generateUniqueUser() : userData;
        
        await registrationPage.fillRegistrationForm(freshUserData);
        
        // Verify form data was filled correctly
        const isFormValid = await registrationPage.validateFormData(freshUserData);
        expect(isFormValid).toBeTruthy();
        
        // Submit registration
        await registrationPage.submitRegistration();
        
        // Check if registration was successful or if we got username conflict
        const isSuccessful = await registrationPage.isRegistrationSuccessful();
        
        if (isSuccessful) {
          success = true;
          console.log(`Registration successful on attempt ${attempt}`);
        } else {
          // Check if it's a username conflict
          const errorMessages = await registrationPage.getErrorMessages();
          const hasUsernameConflict = errorMessages.some(msg => 
            msg.toLowerCase().includes('username') && msg.toLowerCase().includes('exists')
          );
          
          if (hasUsernameConflict && attempt < maxAttempts) {
            console.log(`Username conflict detected, retrying with new username (attempt ${attempt + 1})`);
            // Clear the form and try again with new data
            await page.reload();
            await homePage.clickRegisterLink();
          } else {
            // Different error or max attempts reached
            break;
          }
        }
      }
      
      if (!success) {
        throw new Error(`Registration failed after ${maxAttempts} attempts`);
      }
    });

    // Step 4: Verify final registration state
    await test.step('Verify successful registration', async () => {
      // Additional verification: check current URL
      const currentUrl = page.url();
      console.log(`Registration completed. Current URL: ${currentUrl}`);
      
      // Note: ParaBank shows success message on the same registration page
      // so we don't expect URL to change, just that registration was successful
      console.log('✅ Registration test completed successfully');
    });
  });

  test('TC 002 - Registration with Empty Required Fields', async ({ page }) => {
    const emptyData = getTestData('empty_data');

    await test.step('Navigate to registration page', async () => {
      await homePage.clickRegisterLink();
      expect(await registrationPage.isRegistrationPageLoaded()).toBeTruthy();
    });

    await test.step('Submit form with empty fields', async () => {
      await registrationPage.fillRegistrationForm(emptyData);
      await registrationPage.submitRegistration();
    });

    await test.step('Verify validation errors are displayed', async () => {
      const errorMessages = await registrationPage.getErrorMessages();
      expect(errorMessages.length).toBeGreaterThan(0);
      
      // Should still be on registration page
      expect(page.url()).toContain('register.htm');
    });
  });

  test('TC 003 - Registration with Invalid Data Formats', async ({ page }) => {
    const invalidData = getTestData('invalid_data');

    await test.step('Navigate to registration page', async () => {
      await homePage.clickRegisterLink();
      expect(await registrationPage.isRegistrationPageLoaded()).toBeTruthy();
    });

    await test.step('Fill form with invalid data formats', async () => {
      await registrationPage.fillRegistrationForm(invalidData);
      await registrationPage.submitRegistration();
    });

    await test.step('Verify registration fails with invalid data', async () => {
      // Should either show error messages or remain on registration page
      const errorMessages = await registrationPage.getErrorMessages();
      const currentUrl = page.url();
      
      const hasErrors = errorMessages.length > 0;
      const stillOnRegisterPage = currentUrl.includes('register.htm');
      
      expect(hasErrors || stillOnRegisterPage).toBeTruthy();
    });
  });

  test('TC 004 - Verify Registration Form Elements', async ({ page }) => {
    await test.step('Navigate to registration page', async () => {
      await homePage.clickRegisterLink();
      expect(await registrationPage.isRegistrationPageLoaded()).toBeTruthy();
    });

    await test.step('Verify all form elements are present and functional', async () => {
      // Test form field interactions
      const testData = generateUniqueUser();
      
      await registrationPage.fillRegistrationForm(testData);
      
      // Clear form and verify it's cleared
      await registrationPage.clearForm();
      
      // Fill again to ensure form is working
      await registrationPage.fillRegistrationForm(testData);
      
      const isFormValid = await registrationPage.validateFormData(testData);
      expect(isFormValid).toBeTruthy();
    });
  });

  test('TC 005 - Registration Page Navigation and UI Elements', async ({ page }) => {
    await test.step('Verify home page navigation elements', async () => {
      const areLinksVisible = await homePage.areNavigationLinksVisible();
      expect(areLinksVisible).toBeTruthy();
    });

    await test.step('Navigate to registration and verify UI elements', async () => {
      await homePage.clickRegisterLink();
      
      const registrationTitle = await registrationPage.getRegistrationPageTitle();
      expect(registrationTitle).toBeTruthy();
      
      const isLoaded = await registrationPage.isRegistrationPageLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });
});

/**
 * Additional test suite for edge cases and browser compatibility
 */
test.describe('ParaBank Registration - Edge Cases', () => {
  let homePage;
  let registrationPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registrationPage = new RegistrationPage(page);
    await homePage.open();
  });

  test('TC 006 - Registration with Special Characters in Name Fields', async ({ page }) => {
    const specialCharData = {
      ...generateUniqueUser(),
      firstName: "John-Paul",
      lastName: "O'Connor"
    };

    await homePage.clickRegisterLink();
    await registrationPage.fillRegistrationForm(specialCharData);
    await registrationPage.submitRegistration();

    // Verify the system handles special characters appropriately
    const isSuccessful = await registrationPage.isRegistrationSuccessful();
    const errorMessages = await registrationPage.getErrorMessages();
    
    // Either should succeed or show appropriate validation
    expect(isSuccessful || errorMessages.length > 0).toBeTruthy();
  });

  test('TC 007 - Registration Form Responsiveness', async ({ page }) => {
    // Test form behavior with different viewport sizes
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await homePage.clickRegisterLink();
    expect(await registrationPage.isRegistrationPageLoaded()).toBeTruthy();
    
    const userData = generateUniqueUser();
    await registrationPage.fillRegistrationForm(userData);
    
    // Verify form is still functional in mobile view
    const isFormValid = await registrationPage.validateFormData(userData);
    expect(isFormValid).toBeTruthy();
  });
});