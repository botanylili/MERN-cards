const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const url = 'mongodb+srv://lilia:COP4331Rocks@cluster0.zfexgzm.mongodb.net/COP4331Cards?retryWrites=true&w=majority';
const client = new MongoClient(url);
client.connect().then(() => console.log("Connected to MongoDB")).catch(err => console.error("Mongo connection error:", err));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.post('/api/login', async (req, res, next) => {
  let error = '';
  const { login, password } = req.body;

  let id = -1;
  let fn = '';
  let ln = '';

  if (login.toLowerCase() === 'rickl' && password === 'COP4331') {
    id = 1;
    fn = 'Rick';
    ln = 'Leinecker';
  }
  else {
    error = 'Invalid user name/password';
  }

  let ret = { id: id, firstName: fn, lastName: ln, error: error };
  res.status(200).json(ret);
});

app.post('/api/addcard', async (req, res, next) => {
  const { userId, card } = req.body;
  const newCard = { Card: card, UserId: userId };
  let error = '';

  try {
    const db = client.db('COP4331Cards');
    await db.collection('Cards').insertOne(newCard);
  }
  catch (e) {
    error = e.toString();
  }

  let ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/searchcards', async (req, res, next) => {
  let error = '';
  const { userId, search } = req.body;
  let _search = (search || '').trim();

  let _ret = [];
  try {
    const db = client.db('COP4331Cards');
    const results = await db.collection('Cards').find({ "Card": { $regex: _search + '.*', $options: 'i' } }).toArray();
    for (let i = 0; i < results.length; i++) {
      _ret.push(results[i].Card);
    }
  }
  catch (e) {
    error = e.toString();
  }

  let ret = { results: _ret, error: error };
  res.status(200).json(ret);
});

const path = require('path');

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

app.listen(5000, () => {
  console.log('Server running on port 5000');
});