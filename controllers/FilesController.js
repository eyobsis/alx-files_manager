import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const { name, type, data, parentId = '0', isPublic = false } = req.body;

    const user = await dbClient.findUser({ token: req.token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0') {
      const parentFile = await dbClient.filesCollection().findOne({ _id: parentId });
      if (!parentFile || parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Invalid parent' });
      }
    }

    let localPath = null;
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${uuidv4()}.${name.split('.').pop()}`;
      localPath = path.join(folderPath, fileName);

      try {
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      } catch (error) {
        return res.status(500).json({ error: 'Failed to save file' });
      }
    }

    const newFile = {
      userId: user.id,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };
    const { insertedId } = await dbClient.filesCollection().insertOne(newFile);

    res.status(201).json({
      id: insertedId,
      userId: user.id,
      name,
      type,
      isPublic,
      parentId,
    });
  }

  static async getShow(req, res) {
    const { id } = req.params;

    const user = await dbClient.findUser({ token: req.token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.filesCollection().findOne({ _id: id, userId: user.id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(file);
  }

  static async getIndex(req, res) {
    const { parentId = '0', page = 0 } = req.query;
    const limit = 20;
    const skip = parseInt(page) * limit;

    const user = await dbClient.findUser({ token: req.token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = await dbClient.filesCollection()
      .find({ parentId, userId: user.id })
      .limit(limit)
      .skip(skip)
      .toArray();

    return res.json(files);
  }

  static async putPublish(req, res) {
    const { id } = req.params;

    const user = await dbClient.findUser({ token: req.token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedFile = await dbClient.filesCollection().findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: { isPublic: true } },
      { returnOriginal: false }
    );

    if (!updatedFile.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(updatedFile.value);
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;

    const user = await dbClient.findUser({ token: req.token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedFile = await dbClient.filesCollection().findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: { isPublic: false } },
      { returnOriginal: false }
    );

    if (!updatedFile.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(updatedFile.value);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const { size } = req.query;

    const file = await dbClient.filesCollection().findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic && (!req.user || req.user.id !== file.userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    let filePath = file.localPath;

    if (size && ['500', '250', '100'].includes(size)) {
      const thumbnailPath = `${file.localPath}_${size}`;
      if (fs.existsSync(thumbnailPath)) {
        filePath = thumbnailPath;
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.sendFile(filePath);
  }
}

export default FilesController;
