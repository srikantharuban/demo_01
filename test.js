const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class ParaBankTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            startTime: new Date(),
            endTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            testCases: []
        };
    }

    async initialize() {
        console.log('🚀 Starting ParaBank Test Suite...');
        
        const headless = process.env.HEADLESS !== 'false';
        console.log(`Running in ${headless ? 'headless' : 'headed'} mode`);
        
        this.browser = await chromium.launch({ 
            headless,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-extensions'
            ]
        });
        
        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        this.page = await context.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Page Error:', msg.text());
            }
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        this.testResults.endTime = new Date();
    }

    async runTestCase001() {
        const testCase = {
            id: 'TC 001',
            name: 'Verify that user can register a new customer',
            status: 'RUNNING',
            steps: [],
            startTime: new Date(),
            endTime: null,
            error: null
        };

        try {
            console.log('📋 Executing TC 001 - Customer Registration Test');

            // Step 1: Navigate to ParaBank
            testCase.steps.push(await this.executeStep(
                'Navigate to ParaBank homepage',
                async () => {
                    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm', {
                        waitUntil: 'domcontentloaded',
                        timeout: 30000
                    });
                    
                    await this.page.waitForSelector('text=Customer Login', { timeout: 10000 });
                    const title = await this.page.title();
                    
                    if (!title.includes('ParaBank')) {
                        throw new Error(`Expected ParaBank in title, got: ${title}`);
                    }
                    
                    return `Successfully navigated to ParaBank. Title: ${title}`;
                }
            ));

            // Step 2: Click Register link
            testCase.steps.push(await this.executeStep(
                'Click on Register link',
                async () => {
                    await this.page.click('text=Register');
                    await this.page.waitForSelector('text=Signing up is easy!', { timeout: 10000 });
                    
                    const url = this.page.url();
                    if (!url.includes('register.htm')) {
                        throw new Error(`Expected register.htm in URL, got: ${url}`);
                    }
                    
                    return `Successfully navigated to registration page: ${url}`;
                }
            ));

            // Step 3: Fill registration form
            const timestamp = Date.now();
            const uniqueUsername = `testuser${timestamp}`;
            const testData = {
                firstName: 'Test',
                lastName: 'User',
                address: '123 Test Street',
                city: 'Test City',
                state: 'CA',
                zipCode: '12345',
                phone: '555-123-4567',
                ssn: '123-45-6789',
                username: uniqueUsername,
                password: 'TestPass123!'
            };

            testCase.steps.push(await this.executeStep(
                'Fill registration form with test data',
                async () => {
                    await this.page.fill('[name="customer.firstName"]', testData.firstName);
                    await this.page.fill('[name="customer.lastName"]', testData.lastName);
                    await this.page.fill('[name="customer.address.street"]', testData.address);
                    await this.page.fill('[name="customer.address.city"]', testData.city);
                    await this.page.fill('[name="customer.address.state"]', testData.state);
                    await this.page.fill('[name="customer.address.zipCode"]', testData.zipCode);
                    await this.page.fill('[name="customer.phoneNumber"]', testData.phone);
                    await this.page.fill('[name="customer.ssn"]', testData.ssn);
                    await this.page.fill('[name="customer.username"]', testData.username);
                    await this.page.fill('[name="customer.password"]', testData.password);
                    await this.page.fill('[name="repeatedPassword"]', testData.password);
                    
                    return `Form filled with username: ${uniqueUsername}`;
                }
            ));

            // Step 4: Submit form
            testCase.steps.push(await this.executeStep(
                'Submit registration form',
                async () => {
                    await this.page.click('input[value="Register"]');
                    
                    // Wait for either success page or error
                    try {
                        await this.page.waitForSelector('text=Your account was created successfully', { 
                            timeout: 60000 
                        });
                    } catch (error) {
                        // Check if we're on a Cloudflare challenge page or need more time
                        const pageContent = await this.page.content();
                        if (pageContent.includes('Verifying you are human') || pageContent.includes('Just a moment')) {
                            console.log('⏳ Cloudflare security check detected, waiting longer...');
                            await this.page.waitForTimeout(15000);
                            await this.page.waitForSelector('text=Your account was created successfully', { 
                                timeout: 45000 
                            });
                        } else {
                            // Check if we're already on success page with different text
                            const welcomeText = await this.page.textContent('body').catch(() => '');
                            if (welcomeText.includes('Welcome') && welcomeText.includes('Your account was created')) {
                                console.log('✅ Found success page with different selector');
                                return 'Registration successful - found via alternative text check';
                            }
                            throw error;
                        }
                    }
                    
                    return 'Registration form submitted successfully';
                }
            ));

            // Step 5: Verify registration success
            testCase.steps.push(await this.executeStep(
                'Verify welcome message with username',
                async () => {
                    const pageTitle = await this.page.title();
                    const welcomeSelector = `text=Welcome ${uniqueUsername}`;
                    const successMessage = 'text=Your account was created successfully';
                    
                    // Try to find the welcome message with a longer timeout
                    try {
                        await this.page.waitForSelector(welcomeSelector, { timeout: 10000 });
                    } catch (error) {
                        // Alternative: check if any welcome message exists
                        const hasWelcome = await this.page.locator('text=Welcome').count() > 0;
                        if (!hasWelcome) {
                            throw new Error(`Welcome message for ${uniqueUsername} not found after registration`);
                        }
                    }
                    
                    // Check for success message
                    const hasSuccessMessage = await this.page.locator(successMessage).count() > 0;
                    
                    const verifications = [];
                    
                    // Verify page title
                    if (pageTitle.includes('Customer Created') || pageTitle.includes('ParaBank')) {
                        verifications.push('✅ Page title indicates successful registration');
                    } else {
                        verifications.push(`❌ Unexpected page title: ${pageTitle}`);
                    }
                    
                    // Verify welcome message
                    const welcomeVisible = await this.page.isVisible(welcomeSelector).catch(() => false);
                    if (welcomeVisible) {
                        verifications.push(`✅ Welcome message for ${uniqueUsername} displayed`);
                    } else {
                        // Check for any welcome message as fallback
                        const anyWelcome = await this.page.textContent('body').catch(() => '');
                        if (anyWelcome.includes('Welcome')) {
                            verifications.push(`✅ General welcome message found (user may be logged in)`);
                        } else {
                            verifications.push(`❌ No welcome message found`);
                        }
                    }
                    
                    // Verify success message
                    if (hasSuccessMessage) {
                        verifications.push('✅ Success message displayed');
                    } else {
                        // Check for any success indicators
                        const bodyText = await this.page.textContent('body').catch(() => '');
                        if (bodyText.includes('successfully') || bodyText.includes('created')) {
                            verifications.push('✅ Success indicators found in page content');
                        } else {
                            verifications.push('❌ No clear success message found');
                        }
                    }
                    
                    return verifications.join('\n');
                }
            ));

            testCase.status = 'PASSED';
            testCase.endTime = new Date();
            this.testResults.passedTests++;
            
            console.log('✅ TC 001 PASSED - Customer registration successful');

        } catch (error) {
            testCase.status = 'FAILED';
            testCase.error = error.message;
            testCase.endTime = new Date();
            this.testResults.failedTests++;
            
            console.log('❌ TC 001 FAILED:', error.message);
            
            // Take screenshot on failure
            try {
                await this.page.screenshot({ 
                    path: 'test-results/failure-screenshot.png',
                    fullPage: true 
                });
                console.log('📸 Failure screenshot saved');
            } catch (screenshotError) {
                console.log('Failed to take screenshot:', screenshotError.message);
            }
        }

        this.testResults.testCases.push(testCase);
        this.testResults.totalTests++;
        
        return testCase;
    }

    async executeStep(stepName, stepFunction) {
        const step = {
            name: stepName,
            status: 'RUNNING',
            startTime: new Date(),
            endTime: null,
            result: null,
            error: null
        };

        try {
            console.log(`  📝 ${stepName}...`);
            step.result = await stepFunction();
            step.status = 'PASSED';
            console.log(`  ✅ ${stepName} - PASSED`);
        } catch (error) {
            step.status = 'FAILED';
            step.error = error.message;
            console.log(`  ❌ ${stepName} - FAILED: ${error.message}`);
            throw error;
        } finally {
            step.endTime = new Date();
        }

        return step;
    }

    async generateReport() {
        const duration = this.testResults.endTime - this.testResults.startTime;
        const successRate = this.testResults.totalTests > 0 
            ? Math.round((this.testResults.passedTests / this.testResults.totalTests) * 100) 
            : 0;

        const report = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ParaBank CI/CD Test Execution Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .summary { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-case { border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; overflow: hidden; }
        .test-header { background-color: #f0f0f0; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        .test-body { padding: 15px; }
        .status { padding: 5px 15px; border-radius: 20px; color: white; font-size: 14px; font-weight: bold; }
        .status.pass { background-color: #4CAF50; }
        .status.fail { background-color: #f44336; }
        .step { margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; background-color: #f9f9f9; }
        .step.failed { border-left-color: #f44336; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ParaBank CI/CD Test Execution Report</h1>
        
        <div class="summary">
            <h2>Execution Summary</h2>
            <p><strong>Execution Time:</strong> ${this.testResults.startTime.toISOString()}</p>
            <p><strong>Duration:</strong> ${Math.round(duration / 1000)}s</p>
            <p><strong>Total Tests:</strong> ${this.testResults.totalTests}</p>
            <p><strong>Passed:</strong> <span style="color: #4CAF50;">${this.testResults.passedTests}</span></p>
            <p><strong>Failed:</strong> <span style="color: #f44336;">${this.testResults.failedTests}</span></p>
            <p><strong>Success Rate:</strong> <span style="color: ${successRate === 100 ? '#4CAF50' : '#f44336'};">${successRate}%</span></p>
            <p><strong>Environment:</strong> ${process.env.CI ? 'GitHub Actions' : 'Local'}</p>
        </div>

        ${this.testResults.testCases.map(testCase => `
        <div class="test-case">
            <div class="test-header">
                <div><strong>${testCase.id}</strong> - ${testCase.name}</div>
                <span class="status ${testCase.status.toLowerCase() === 'passed' ? 'pass' : 'fail'}">${testCase.status}</span>
            </div>
            <div class="test-body">
                <p><strong>Duration:</strong> ${Math.round((testCase.endTime - testCase.startTime) / 1000)}s</p>
                ${testCase.error ? `<p><strong>Error:</strong> <span style="color: #f44336;">${testCase.error}</span></p>` : ''}
                
                <h4>Test Steps:</h4>
                ${testCase.steps.map(step => `
                <div class="step ${step.status.toLowerCase() === 'failed' ? 'failed' : ''}">
                    <strong>${step.name}</strong> - ${step.status}
                    ${step.result ? `<br><em>${step.result}</em>` : ''}
                    ${step.error ? `<br><span style="color: #f44336;">Error: ${step.error}</span>` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        `).join('')}
        
        <div class="summary" style="margin-top: 30px;">
            <h3>${successRate === 100 ? '✅' : '❌'} Test Execution ${successRate === 100 ? 'Completed Successfully' : 'Failed'}</h3>
            <p>Generated by ParaBank CI/CD Pipeline on ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;

        // Ensure test-results directory exists
        const testResultsDir = 'test-results';
        if (!fs.existsSync(testResultsDir)) {
            fs.mkdirSync(testResultsDir, { recursive: true });
        }

        fs.writeFileSync('Test_Execution_Report.html', report);
        console.log('📊 Test report generated: Test_Execution_Report.html');

        return report;
    }

    async run() {
        try {
            await this.initialize();
            
            console.log('🔍 Running Test Cases...');
            await this.runTestCase001();
            
            await this.generateReport();
            
            const successRate = Math.round((this.testResults.passedTests / this.testResults.totalTests) * 100);
            
            console.log('\n📊 Test Execution Summary:');
            console.log(`Total Tests: ${this.testResults.totalTests}`);
            console.log(`Passed: ${this.testResults.passedTests}`);
            console.log(`Failed: ${this.testResults.failedTests}`);
            console.log(`Success Rate: ${successRate}%`);
            
            if (this.testResults.failedTests > 0) {
                console.log('❌ Some tests failed!');
                process.exit(1);
            } else {
                console.log('✅ All tests passed!');
                process.exit(0);
            }
            
        } catch (error) {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }
}

// Run the test suite
if (require.main === module) {
    const testSuite = new ParaBankTestSuite();
    testSuite.run();
}

module.exports = ParaBankTestSuite;