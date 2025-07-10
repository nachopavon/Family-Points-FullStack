const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests
process.env.JWT_SECRET = 'test-jwt-secret';

// Clean up test database before each test
beforeEach(async () => {
  // Database cleanup will be handled by individual tests
});

// Global teardown
afterAll(async () => {
  // Clean up any test files
  const testFiles = [
    path.join(__dirname, 'test-database.sqlite'),
    path.join(__dirname, '../database.sqlite')
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
});