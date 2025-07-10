const { v4: uuidv4 } = require('uuid');

// Mock the models
jest.mock('../src/models/Task');
jest.mock('../src/models/CompletedTask');
jest.mock('../src/models/FamilyMember');

const Task = require('../src/models/Task');
const CompletedTask = require('../src/models/CompletedTask');
const FamilyMember = require('../src/models/FamilyMember');
const TaskController = require('../src/controllers/taskController');

describe('TaskController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response objects
    mockReq = {
      body: {},
      params: {},
      user: { id: 'test-user-id' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('getTasks', () => {
    it('should return user tasks successfully', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          name: 'Clean dishes',
          description: 'Wash all dishes',
          points: 10,
          category: 'Kitchen',
          icon: '🍽️',
          user_id: 'test-user-id'
        },
        {
          id: 'task-2',
          name: 'Walk the dog',
          description: 'Take the dog for a walk',
          points: 5,
          category: 'Pets',
          icon: '🐕',
          user_id: 'test-user-id'
        }
      ];

      Task.findByUserId.mockResolvedValue(mockTasks);

      await TaskController.getTasks(mockReq, mockRes, mockNext);

      expect(Task.findByUserId).toHaveBeenCalledWith('test-user-id');
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      Task.findByUserId.mockRejectedValue(testError);

      await TaskController.getTasks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('createTask', () => {
    beforeEach(() => {
      mockReq.body = {
        name: 'New Task',
        description: 'Task description',
        points: 15,
        category: 'Home',
        icon: '🏠'
      };
    });

    it('should create a new task successfully', async () => {
      const mockCreatedTask = {
        id: 'new-task-id',
        user_id: 'test-user-id',
        name: 'New Task',
        description: 'Task description',
        points: 15,
        category: 'Home',
        icon: '🏠',
        is_default: false
      };

      Task.create.mockResolvedValue(mockCreatedTask);

      await TaskController.createTask(mockReq, mockRes, mockNext);

      expect(Task.create).toHaveBeenCalledWith({
        id: expect.any(String),
        user_id: 'test-user-id',
        name: 'New Task',
        description: 'Task description',
        points: 15,
        category: 'Home',
        icon: '🏠',
        is_default: false
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedTask);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should create task with default icon when none provided', async () => {
      mockReq.body = {
        name: 'New Task',
        points: 15,
        category: 'Home'
      };

      const mockCreatedTask = {
        id: 'new-task-id',
        user_id: 'test-user-id',
        name: 'New Task',
        description: null,
        points: 15,
        category: 'Home',
        icon: '📝',
        is_default: false
      };

      Task.create.mockResolvedValue(mockCreatedTask);

      await TaskController.createTask(mockReq, mockRes, mockNext);

      expect(Task.create).toHaveBeenCalledWith({
        id: expect.any(String),
        user_id: 'test-user-id',
        name: 'New Task',
        description: null,
        points: 15,
        category: 'Home',
        icon: '📝',
        is_default: false
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedTask);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      Task.create.mockRejectedValue(testError);

      await TaskController.createTask(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('completeTask', () => {
    const mockTask = {
      id: 'task-1',
      name: 'Clean dishes',
      points: 10,
      category: 'Kitchen',
      user_id: 'test-user-id'
    };

    const mockMember = {
      id: 'member-1',
      name: 'Test Member',
      user_id: 'test-user-id'
    };

    beforeEach(() => {
      mockReq.params = { id: 'task-1' };
      mockReq.body = {
        memberId: 'member-1',
        notes: 'Task completed successfully'
      };
    });

    it('should complete task successfully', async () => {
      const mockCompletedTask = {
        id: 'completed-task-id',
        task_id: 'task-1',
        member_id: 'member-1',
        user_id: 'test-user-id',
        points: 10,
        notes: 'Task completed successfully',
        completed_at: new Date().toISOString()
      };

      Task.findById.mockResolvedValue(mockTask);
      FamilyMember.findById.mockResolvedValue(mockMember);
      CompletedTask.create.mockResolvedValue(mockCompletedTask);
      FamilyMember.addPoints.mockResolvedValue({});

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(Task.findById).toHaveBeenCalledWith('task-1');
      expect(FamilyMember.findById).toHaveBeenCalledWith('member-1');
      expect(CompletedTask.create).toHaveBeenCalledWith({
        id: expect.any(String),
        task_id: 'task-1',
        member_id: 'member-1',
        user_id: 'test-user-id',
        points: 10,
        notes: 'Task completed successfully'
      });
      expect(FamilyMember.addPoints).toHaveBeenCalledWith('member-1', 10);
      expect(mockRes.json).toHaveBeenCalledWith(mockCompletedTask);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when task not found', async () => {
      Task.findById.mockResolvedValue(null);

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'TASK_NOT_FOUND',
        message: 'Tarea no encontrada'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when task does not belong to user', async () => {
      const foreignTask = { ...mockTask, user_id: 'other-user-id' };
      Task.findById.mockResolvedValue(foreignTask);

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'ACCESS_DENIED',
        message: 'No tiene acceso a esta tarea'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when member not found', async () => {
      Task.findById.mockResolvedValue(mockTask);
      FamilyMember.findById.mockResolvedValue(null);

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'MEMBER_NOT_FOUND',
        message: 'Miembro de familia no encontrado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when member does not belong to user', async () => {
      const foreignMember = { ...mockMember, user_id: 'other-user-id' };
      Task.findById.mockResolvedValue(mockTask);
      FamilyMember.findById.mockResolvedValue(foreignMember);

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'ACCESS_DENIED',
        message: 'No tiene acceso a este miembro de familia'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const testError = new Error('Database error');
      Task.findById.mockRejectedValue(testError);

      await TaskController.completeTask(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});