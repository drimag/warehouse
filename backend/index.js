const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRouter = require('./routes/api');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000'
];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, '../ui/dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));