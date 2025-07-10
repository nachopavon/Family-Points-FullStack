const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock the models
jest.mock('../src/models/User');
jest.mock('../src/models/UserSession');
jest.mock('../src/models/Task');

const User = require('../src/models/User');
const UserSession = require('../src/models/UserSession');
const Task = require('../src/models/Task');
const AuthController = require('../src/controllers/authController');

describe('AuthController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response objects
    mockReq = {
      body: {},
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('login', () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      family_name: 'Test Family',
      avatar: '👨‍👩‍👧‍👦'
    };

    beforeEach(() => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      };
    });

    it('should login successfully with valid credentials', async () => {
      // Mock user found
      User.findByUsername.mockResolvedValue(mockUser);
      
      // Mock password comparison
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      
      // Mock session creation
      UserSession.create.mockResolvedValue({});
      
      // Mock user update
      User.update.mockResolvedValue({});
      
      // Mock JWT sign
      const mockToken = 'mock-jwt-token';
      const jwtSignSpy = jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(User.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptCompareSpy).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(UserSession.create).toHaveBeenCalled();
      expect(User.update).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com'
        }),
        token: mockToken,
        expiresIn: 24 * 60 * 60
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for non-existent user', async () => {
      User.findByUsername.mockResolvedValue(null);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales incorrectas'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
      User.findByUsername.mockResolvedValue(mockUser);
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(bcryptCompareSpy).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales incorrectas'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      User.findByUsername.mockRejectedValue(testError);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('register', () => {
    beforeEach(() => {
      mockReq.body = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        familyName: 'New Family',
        avatar: '👨‍👩‍👧‍👦'
      };
    });

    it('should register a new user successfully', async () => {
      // Mock no existing user
      User.findByUsername.mockResolvedValue(null);
      User.findByEmail.mockResolvedValue(null);
      
      // Mock password hashing
      const hashedPassword = 'hashedpassword';
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      
      // Mock user creation
      const mockCreatedUser = {
        id: 'new-user-id',
        username: 'newuser',
        email: 'newuser@example.com',
        family_name: 'New Family',
        avatar: '👨‍👩‍👧‍👦'
      };
      User.create.mockResolvedValue(mockCreatedUser);
      
      // Mock session creation
      UserSession.create.mockResolvedValue({});
      
      // Mock task creation
      Task.createDefaultTasks.mockResolvedValue({});
      
      // Mock JWT sign
      const mockToken = 'mock-jwt-token';
      const jwtSignSpy = jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(User.findByUsername).toHaveBeenCalledWith('newuser');
      expect(User.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(bcryptHashSpy).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        id: expect.any(String),
        username: 'newuser',
        email: 'newuser@example.com',
        password_hash: hashedPassword,
        family_name: 'New Family',
        avatar: '👨‍👩‍👧‍👦'
      });
      expect(UserSession.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'new-user-id',
          username: 'newuser',
          email: 'newuser@example.com'
        }),
        token: mockToken,
        expiresIn: 24 * 60 * 60
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 409 when username already exists', async () => {
      User.findByUsername.mockResolvedValue({ id: 'existing-user' });

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'USERNAME_EXISTS',
        message: 'El nombre de usuario ya está en uso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 409 when email already exists', async () => {
      User.findByUsername.mockResolvedValue(null);
      User.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'EMAIL_EXISTS',
        message: 'El email ya está registrado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      User.findByUsername.mockRejectedValue(testError);

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});