import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Routes
app.use('/', router);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
