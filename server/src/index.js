require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db/index.js');
const app = express();

app.use(cors());
app.use(express.json());

// TODO: remove this
app.get('/test', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT id, name FROM test ORDER BY created_at');
      res.json(rows);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));