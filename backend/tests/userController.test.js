// Mock the models
jest.mock('../src/models/User');

const User = require('../src/models/User');
const UserController = require('../src/controllers/userController');

describe('UserController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response objects
    mockReq = {
      body: {},
      user: { id: 'test-user-id' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      family_name: 'Test Family',
      avatar: '👨‍👩‍👧‍👦',
      created_at: '2023-01-01T00:00:00.000Z',
      last_login: '2023-01-02T00:00:00.000Z'
    };

    it('should return user profile successfully', async () => {
      User.findById.mockResolvedValue(mockUser);

      await UserController.getProfile(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await UserController.getProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      User.findById.mockRejectedValue(testError);

      await UserController.getProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      family_name: 'Test Family',
      avatar: '👨‍👩‍👧‍👦'
    };

    beforeEach(() => {
      mockReq.body = {
        email: 'newemail@example.com',
        familyName: 'New Family Name',
        avatar: '👨‍👩‍👧‍👦'
      };
    });

    it('should update user profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
        family_name: 'New Family Name'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findByEmail.mockResolvedValue(null); // Email is available
      User.update.mockResolvedValue(updatedUser);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(User.findByEmail).toHaveBeenCalledWith('newemail@example.com');
      expect(User.update).toHaveBeenCalledWith('test-user-id', {
        email: 'newemail@example.com',
        family_name: 'New Family Name',
        avatar: '👨‍👩‍👧‍👦'
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 409 when email already exists', async () => {
      const existingEmailUser = { id: 'other-user-id', email: 'newemail@example.com' };
      
      User.findById.mockResolvedValue(mockUser);
      User.findByEmail.mockResolvedValue(existingEmailUser);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'EMAIL_EXISTS',
        message: 'El email ya está en uso por otro usuario'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not check email availability when email is not changed', async () => {
      mockReq.body = {
        email: 'test@example.com', // Same email
        familyName: 'New Family Name'
      };

      const updatedUser = {
        ...mockUser,
        family_name: 'New Family Name'
      };

      User.findById.mockResolvedValue(mockUser);
      User.update.mockResolvedValue(updatedUser);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(User.findByEmail).not.toHaveBeenCalled(); // Should not check email
      expect(User.update).toHaveBeenCalledWith('test-user-id', {
        email: 'test@example.com',
        family_name: 'New Family Name'
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      mockReq.body = {
        familyName: 'New Family Name'
        // Only familyName provided
      };

      const updatedUser = {
        ...mockUser,
        family_name: 'New Family Name'
      };

      User.findById.mockResolvedValue(mockUser);
      User.update.mockResolvedValue(updatedUser);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(User.update).toHaveBeenCalledWith('test-user-id', {
        family_name: 'New Family Name'
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      User.findById.mockRejectedValue(testError);

      await UserController.updateProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});