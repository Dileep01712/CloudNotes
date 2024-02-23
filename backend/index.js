require('dotenv').config();
const connectToMongoose = require('./db');
const express = require('express')
const cors = require('cors');

connectToMongoose();

const app = express()
const port = 5000

app.use(cors());
app.use(express.json()) // Middle ware

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`CloudNotes Backend listening on port http://localhost:${port}`)
})