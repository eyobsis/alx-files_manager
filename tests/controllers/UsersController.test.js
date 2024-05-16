import { postNew, getMe } from '../../controllers/AuthController';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

jest.mock('../utils/db');
jest.mock('../utils/redis');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, headers: {} };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('postNew', () => {
    it('should create new user and return status 201', async () => {
      req.body.email = 'test@example.com';
      req.body.password = 'password';
      dbClient.findUser = jest.fn(() => Promise.resolve(null));
      dbClient.addUsers = jest.fn(() => Promise.resolve({ _id: 'userId', email: 'test@example.com' }));
      await postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'userId', email: 'test@example.com' });
    });

    it('should return bad request if email is missing', async () => {
      req.body.password = 'password';
      await postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Missing email');
    });

    it('should return bad request if password is missing', async () => {
      req.body.email = 'test@example.com';
      await postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Missing password');
    });

    it('should return bad request if user already exists', async () => {
      req.body.email = 'existing@example.com';
      req.body.password = 'password';
      dbClient.findUser = jest.fn(() => Promise.resolve({ _id: 'userId', email: 'existing@example.com' }));
      await postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Already exist');
    });

    // Add more test cases for different scenarios
  });

  describe('getMe', () => {
    it('should return user info if token is valid', async () => {
      req.headers['x-token'] = 'validToken';
      redisClient.get = jest.fn(() => Promise.resolve('userId'));
      dbClient.findUser = jest.fn(() => Promise.resolve({ _id: 'userId', email: 'test@example.com' }));
      await getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({ id: 'userId', email: 'test@example.com' });
    });

    it('should return unauthorized error if token is invalid', async () => {
      req.headers['x-token'] = 'invalidToken';
      redisClient.get = jest.fn(() => Promise.resolve(null));
      await getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for different scenarios
  });
});
