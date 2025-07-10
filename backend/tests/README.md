# Backend Unit Tests

This directory contains unit tests for the Family Points Backend API.

## Test Structure

The tests are organized as follows:

```
tests/
├── setup.js                  # Test configuration and setup
├── authController.test.js    # Authentication controller tests
├── taskController.test.js    # Task controller tests
└── userController.test.js    # User controller tests
```

## Test Coverage

The tests cover the main functions of the backend controllers:

### AuthController
- `login()` - User authentication
- `register()` - User registration

### TaskController  
- `getTasks()` - Get user tasks
- `createTask()` - Create new task
- `completeTask()` - Complete a task

### UserController
- `getProfile()` - Get user profile
- `updateProfile()` - Update user profile

## Running Tests

To run all tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm test -- --coverage
```

To run specific test file:
```bash
npm test -- tests/authController.test.js
```

## Test Configuration

- Tests use Jest as the testing framework
- Supertest is available for API endpoint testing
- Models are mocked to avoid database dependencies
- Test environment uses in-memory SQLite database
- JWT secret is set to a test value

## Test Philosophy

These tests focus on:
- Testing the business logic of controller functions
- Validating error handling
- Ensuring proper HTTP status codes and responses
- Mocking external dependencies (database, models)
- Testing both success and failure scenarios

The tests use mocking extensively to isolate the unit under test and avoid dependencies on the actual database or external services.