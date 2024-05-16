import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import userQueue from '../utils/worker';

async function postNew(req, res) {
  const { email, password } = req.body;

  console.log(email, password);
  if (!email) return res.status(400).send('Missing email');
  if (!password) { return res.status(400).send('Missing password'); }
  if (await dbClient.findUser({ email })) return res.status(400).send('Already exist');
  const user = await dbClient.addUsers(email, sha1(password));


  userQueue.add({ userId: newUser._id });
  return res.status(201).json({ id: user._id, email: user.email });
}

async function getMe(req, res) {
  console.log(req.headers['x-token']);
  const token = await redisClient.get(`auth_${req.headers['x-token']}`);
  console.log(token);
  if (token) {
    const user = await dbClient.findUser({ _id: token });
    console.log('getme: ', user);
    return res.status(204).json({ id: user._id, email: user.email });
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = {
  postNew,
  getMe,
};