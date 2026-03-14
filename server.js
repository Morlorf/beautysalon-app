require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static('public', {
  maxAge: '1h',
  etag: false
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(__dirname + '/public/manifest.json');
});

app.listen(PORT, () => {
  console.log(`Beauty Salon Manager running at http://localhost:${PORT}`);
});
