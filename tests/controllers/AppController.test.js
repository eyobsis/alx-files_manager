//AppController.test.js
import AppController from '../../controllers/AppController';
import redisClient from '../../utils/redis';
import dbClient from '../../utils/db';

describe('AppController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should return status of redisClient and dbClient', () => {
      redisClient.isAlive = jest.fn(() => true);
      dbClient.isAlive = jest.fn(() => true);
      AppController.getStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ redis: true, db: true });
    });

    // Add more test cases for different scenarios
  });

  describe('getStats', () => {
    it('should return number of users and files', async () => {
      dbClient.nbUsers = jest.fn(() => Promise.resolve(10));
      dbClient.nbFiles = jest.fn(() => Promise.resolve(20));
      await AppController.getStats(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: 10, files: 20 });
    });

    // Add more test cases for different scenarios
  });

  describe('greetUser', () => {
    it('should send a welcome message', () => {
      AppController.greetUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Welcome to the API');
    });

    // Add more test cases for different scenarios
  });
});
