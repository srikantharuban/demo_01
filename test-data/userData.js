/**
 * Test Data for ParaBank Application
 * Contains user data for registration and other test scenarios
 */

const testData = {
  // Base user data for registration tests
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '555-123-4567',
    ssn: '123-45-6789',
    username: `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // Dynamic username to avoid conflicts
    password: 'TestPassword123!'
  },

  // Additional test users for different scenarios
  testUsers: {
    user1: {
      firstName: 'Alice',
      lastName: 'Smith',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      phone: '555-987-6543',
      ssn: '987-65-4321',
      username: `alice_${Date.now()}`,
      password: 'AlicePass123!'
    },
    user2: {
      firstName: 'Bob',
      lastName: 'Johnson',
      address: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      phone: '555-456-7890',
      ssn: '456-78-9012',
      username: `bob_${Date.now()}`,
      password: 'BobPass123!'
    }
  },

  // Invalid data for negative testing
  invalidData: {
    emptyUser: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      ssn: '',
      username: '',
      password: ''
    },
    invalidFormats: {
      firstName: '123',
      lastName: '!@#',
      address: '',
      city: '123',
      state: 'InvalidState',
      zipCode: 'ABC',
      phone: 'invalid-phone',
      ssn: 'invalid-ssn',
      username: 'a', // Too short
      password: '123' // Too weak
    }
  },

  // URLs for different pages
  urls: {
    home: 'https://parabank.parasoft.com/parabank',
    register: 'https://parabank.parasoft.com/parabank/register.htm',
    login: 'https://parabank.parasoft.com/parabank/index.htm'
  },

  // Expected messages
  messages: {
    successMessages: [
      'Your account was created successfully',
      'Welcome',
      'Account Services'
    ],
    errorMessages: {
      requiredField: 'This field is required',
      invalidUsername: 'Username already exists',
      passwordMismatch: 'Passwords did not match'
    }
  },

  // Test configuration
  config: {
    timeouts: {
      short: 5000,
      medium: 15000,
      long: 30000,
      xlarge: 60000
    },
    retries: {
      flaky: 2,
      stable: 0
    }
  }
};

/**
 * Generate a unique user for testing
 * @returns {Object} User data with unique identifiers
 */
function generateUniqueUser() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  
  return {
    firstName: `Test${randomNum}`,
    lastName: `User${randomNum}`,
    address: `${randomNum} Test Street`,
    city: 'TestCity',
    state: 'TC',
    zipCode: `${randomNum.toString().padStart(5, '0')}`,
    phone: `555-${randomNum.toString().padStart(3, '0')}-${timestamp.toString().slice(-4)}`,
    ssn: `${randomNum.toString().padStart(3, '0')}-${timestamp.toString().slice(-6, -3)}-${timestamp.toString().slice(-3)}`,
    username: `u${timestamp.toString(36)}${randomNum.toString(36)}${Math.random().toString(36).substr(2, 5)}`,
    password: `TestPass${randomNum}!`
  };
}

/**
 * Get test data based on scenario
 * @param {string} scenario - The test scenario name
 * @returns {Object} Appropriate test data
 */
function getTestData(scenario) {
  switch (scenario) {
    case 'valid_registration':
      return generateUniqueUser();
    case 'duplicate_user':
      return testData.validUser;
    case 'invalid_data':
      return testData.invalidData.invalidFormats;
    case 'empty_data':
      return testData.invalidData.emptyUser;
    default:
      return generateUniqueUser();
  }
}

module.exports = {
  testData,
  generateUniqueUser,
  getTestData
};