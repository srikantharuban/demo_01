# ParaBank Test Suite CI/CD

This repository contains an automated test suite for the ParaBank application with integrated CI/CD pipeline using GitHub Actions.

## 🚀 Features

- **Automated Testing**: Playwright-based test automation for ParaBank customer registration
- **CI/CD Pipeline**: GitHub Actions workflow for continuous integration
- **Test Reporting**: Comprehensive HTML test reports with detailed results
- **Multi-trigger**: Runs on push, pull requests, schedule, and manual dispatch
- **Cross-platform**: Runs on Ubuntu in GitHub Actions

## 📋 Test Cases

### TC 001 - Customer Registration
- Navigate to ParaBank application
- Click Register link
- Fill registration form with unique test data
- Submit registration
- Verify successful registration with welcome message

## 🔧 Setup & Usage

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npm run install-browsers
   ```

3. **Run Tests Locally**
   ```bash
   # Headless mode (default)
   npm test
   
   # Headed mode (with browser UI)
   npm run test:headed
   ```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/parabank-tests.yml`) automatically:

- **Triggers on**:
  - Push to `main` or `develop` branches
  - Pull requests to `main` branch
  - Daily at 6 AM UTC (scheduled)
  - Manual dispatch via GitHub Actions UI

- **Pipeline Steps**:
  1. Checkout code
  2. Setup Node.js environment
  3. Install dependencies
  4. Install Playwright browsers
  5. Run test suite
  6. Generate test reports
  7. Upload artifacts
  8. Comment results on PRs

### Test Reports

- **HTML Report**: Generated as `Test_Execution_Report.html`
- **Artifacts**: Available in GitHub Actions for 30 days
- **PR Comments**: Automatic test result comments on pull requests

## 📊 Test Results

Test execution generates comprehensive reports including:
- Execution summary with pass/fail counts
- Detailed step-by-step results
- Screenshots on failures
- Execution timestamps and duration
- Environment information

## 🔄 CI/CD Pipeline Status

The pipeline runs automatically and provides:
- ✅ **Continuous Integration**: All code changes are tested
- 📊 **Test Reporting**: Detailed HTML reports with each run
- 🔔 **Notifications**: PR comments with test results
- 📅 **Scheduled Testing**: Daily regression testing
- 🚀 **Manual Triggers**: On-demand test execution

## 🛠️ Customization

### Adding New Tests
1. Add test cases to `TestSuite.md`
2. Implement test methods in `test.js`
3. Update the `run()` method to include new tests

### Modifying CI/CD
- Edit `.github/workflows/parabank-tests.yml`
- Adjust triggers, environment, or reporting as needed

### Test Data
- Unique usernames are generated using timestamps
- Test data is configurable in the test script

## 📁 Project Structure

```
.
├── .github/workflows/
│   └── parabank-tests.yml     # GitHub Actions workflow
├── test.js                    # Main test automation script
├── package.json               # Node.js dependencies and scripts
├── TestSuite.md              # Test case specifications
├── Test_Execution_Report.html # Generated test report
└── README.md                 # This documentation
```

## 🚦 Status Badges

Add these to track your pipeline status:

```markdown
![Tests](https://github.com/srikantharuban/demo_01/actions/workflows/parabank-tests.yml/badge.svg)
```

## 📝 Notes

- Tests run in headless mode in CI/CD for performance
- Cloudflare security checks are handled automatically
- Screenshots are captured on test failures
- All test artifacts are preserved for analysis