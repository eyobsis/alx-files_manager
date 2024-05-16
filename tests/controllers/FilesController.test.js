import FilesController from '../../controllers/FilesController';
import dbClient from '../../utils/db';
import fs from 'fs';

describe('FilesController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      token: 'mockToken',
      body: {},
      params: {},
      query: {},
      user: { id: 'mockUserId' }
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      sendFile: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('postUpload', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.token = ''; // simulate unauthenticated user
      await FilesController.postUpload(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for postUpload function
  });

  describe('getShow', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.token = ''; // simulate unauthenticated user
      await FilesController.getShow(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for getShow function
  });

  describe('getIndex', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.token = ''; // simulate unauthenticated user
      await FilesController.getIndex(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for getIndex function
  });

  describe('putPublish', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.token = ''; // simulate unauthenticated user
      await FilesController.putPublish(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for putPublish function
  });

  describe('putUnpublish', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.token = ''; // simulate unauthenticated user
      await FilesController.putUnpublish(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for putUnpublish function
  });

  describe('getFile', () => {
    it('should return 401 if user is not authenticated and file is not public', async () => {
      req.token = ''; // simulate unauthenticated user
      const fileId = 'mockFileId';
      const query = { _id: fileId };
      const findOneMock = jest.spyOn(dbClient, 'filesCollection').mockImplementation(() => ({
        findOne: jest.fn().mockResolvedValue({ isPublic: false })
      }));
      await FilesController.getFile(req, res);
      expect(findOneMock).toHaveBeenCalledWith(query);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    // Add more test cases for getFile function
  });
});
