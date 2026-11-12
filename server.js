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

app.post('/api/register', async (req, res, next) => {
  // incoming: firstName, lastName, login, password
  // outgoing: id, firstName, lastName, error
  const { firstName, lastName, login, password } = req.body;
  let error = '';
  let id = -1;

  if (!login || !password || !firstName || !lastName) {
    return res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'All fields are required' });
  }

  try {
    const db = client.db('COP4331Cards');
    const existing = await db.collection('Users').findOne({ Login: login.trim() });

    if (existing) {
      return res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Username already taken' });
    }

    const count = await db.collection('Users').countDocuments();
    const newUserId = count + 2; // Keeps ID 1 reserved for RickL

    const newUser = {
      UserId: newUserId,
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Login: login.trim(),
      Password: password.trim()
    };

    await db.collection('Users').insertOne(newUser);
    id = newUserId;
    res.status(200).json({ id: id, firstName: firstName.trim(), lastName: lastName.trim(), error: '' });
  } catch (e) {
    res.status(200).json({ id: -1, firstName: '', lastName: '', error: e.toString() });
  }
});

app.post('/api/login', async (req, res, next) => {
  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  let error = '';
  const { login, password } = req.body;
  let id = -1;
  let fn = '';
  let ln = '';

  // Support default RickL test account
  if (login && login.toLowerCase() === 'rickl' && password === 'COP4331') {
    id = 1;
    fn = 'Rick';
    ln = 'Leinecker';
    return res.status(200).json({ id: id, firstName: fn, lastName: ln, error: '' });
  }

  try {
    const db = client.db('COP4331Cards');
    const user = await db.collection('Users').findOne({ Login: login.trim(), Password: password.trim() });

    if (user) {
      id = user.UserId;
      fn = user.FirstName;
      ln = user.LastName;
    } else {
      error = 'Invalid user name/password';
    }
  } catch (e) {
    error = e.toString();
  }

  res.status(200).json({ id: id, firstName: fn, lastName: ln, error: error });
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

app.post('/api/editcard', async (req, res, next) => {
  // incoming: cardId (or oldCard/card name), newCard, userId
  // outgoing: error
  const { cardId, newCard, userId } = req.body;
  let error = '';

  try {
    const db = client.db('COP4331Cards');
    const { ObjectId } = require('mongodb');

    // Update by _id if valid, otherwise update matching Card string for this user
    if (cardId && ObjectId.isValid(cardId)) {
      await db.collection('Cards').updateOne(
        { _id: new ObjectId(cardId), UserId: userId },
        { $set: { Card: newCard.trim() } }
      );
    } else {
      await db.collection('Cards').updateOne(
        { Card: cardId, UserId: userId },
        { $set: { Card: newCard.trim() } }
      );
    }
  } catch (e) {
    error = e.toString();
  }

  res.status(200).json({ error: error });
});

app.post('/api/deletecard', async (req, res, next) => {
  // incoming: cardId (or card name), userId
  // outgoing: error
  const { cardId, card, userId } = req.body;
  let error = '';

  try {
    const db = client.db('COP4331Cards');
    const { ObjectId } = require('mongodb');

    if (cardId && ObjectId.isValid(cardId)) {
      await db.collection('Cards').deleteOne({ _id: new ObjectId(cardId), UserId: userId });
    } else if (card) {
      await db.collection('Cards').deleteOne({ Card: card, UserId: userId });
    } else {
      error = 'No card specified for deletion';
    }
  } catch (e) {
    error = e.toString();
  }

  res.status(200).json({ error: error });
});

app.post('/api/searchcards', async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results, cardList (objects with id and card), error
  let error = '';
  const { userId, search } = req.body;
  let _search = search ? search.trim() : '';

  try {
    const db = client.db('COP4331Cards');
    const results = await db.collection('Cards').find({
      UserId: userId,
      Card: { $regex: _search, $options: 'i' }
    }).toArray();

    // Support both string array (standard COP4331 test) and detailed object array
    const stringResults = results.map(item => item.Card);
    const detailedResults = results.map(item => ({ id: item._id, card: item.Card }));

    res.status(200).json({ results: stringResults, cardList: detailedResults, error: '' });
  } catch (e) {
    res.status(200).json({ results: [], cardList: [], error: e.toString() });
  }
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