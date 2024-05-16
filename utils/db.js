import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.db = null;
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // connect to mongodb
    const url = `mongodb://${host}:${port}/`;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
      if (err) console.log(err);
      this.db = db.db(database);
      this.db.createCollection('users');
      this.db.createCollection('files');
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const countUsers = await this.db.collection('users').countDocuments();
    return countUsers;
  }

  async addUsers(email, password) {
    await this.db.collection('users').insertOne({ email, password });
    const newUser = await this.db.collection('users').findOne({ email });
    return newUser;
  }

  async findUser(query) {
    const user = await this.db.collection('users').findOne(query);
    return user;
  }

  async nbFiles() {
    const countFiles = await this.db.collection('files').countDocuments();
    return countFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;