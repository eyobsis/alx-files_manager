import { getConnect, getDisconnect } from '../../controllers/AuthController';
import redisClient from '../../utils/redis';
import dbClient from '../../utils/db';

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConnect', () => {
    it('should return token when user is authenticated', async () => {
      req.headers.authorization = 'Basic base64encodedemail:password';
      dbClient.findUser = jest.fn(() => Promise.resolve({ _id: 'userId', password: 'hashedPassword' }));
      redisClient.set = jest.fn(() => Promise.resolve('token'));
      await getConnect(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token' });
    });

    it('should return unauthorized error when user does not exist', async () => {
      req.headers.authorization = 'Basic base64encodedemail:password';
      dbClient.findUser = jest.fn(() => Promise.resolve(null));
      await getConnect(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return unauthorized error when password is incorrect', async () => {
      req.headers.authorization = 'Basic base64encodedemail:password';
      dbClient.findUser = jest.fn(() => Promise.resolve({ _id: 'userId', password: 'hashedPassword' }));
      await getConnect(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for different scenarios
  });

  describe('getDisconnect', () => {
    it('should disconnect user and return status 204', async () => {
      req.headers['X-Token'] = 'userToken';
      redisClient.get = jest.fn(() => Promise.resolve('userId'));
      redisClient.del = jest.fn(() => Promise.resolve());
      await getDisconnect(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return unauthorized error when token is invalid', async () => {
      req.headers['X-Token'] = 'invalidToken';
      redisClient.get = jest.fn(() => Promise.resolve(null));
      await getDisconnect(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for different scenarios
  });
});
