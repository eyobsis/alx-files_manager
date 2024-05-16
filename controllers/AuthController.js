import sha1 from 'sha1';
import uuid4 from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

async function getDisconnect(req, res) {
  const user = await redisClient.get(req.headers['X-Token']);
  if (user) {
    await redisClient.del(`auth_${user}`);
    return res.status(204);
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

function decodeBase64(base64) {
  const buff = Buffer.from(base64, 'base64');
  return buff.toString('utf-8');
}

async function getConnect(req, res) {
  console.log(req.headers);
  const Fbase64 = req.headers.authorization.split(' ')[1];
  const base64 = decodeBase64(Fbase64);
  const email = base64.split(':')[0];
  const password = base64.split(':')[1];
  console.log(email, password);
  const user = await dbClient.findUser({ email });
  if (user) {
    if (sha1(password) === user.password) {
      const uuid = uuid4();
      await redisClient.set(`auth_${uuid}`, user._id.toString(), 24 * 60 * 60);
      return res.status(200).json({ token: uuid });
    }
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { getConnect, getDisconnect };