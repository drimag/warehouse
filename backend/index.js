const express = require('express');
const cors = require('cors');
const waybillRoutes = require('./routes/waybillRoutes');
const unitRoutes = require('./routes/unitRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const manifestRoutes = require('./routes/manifestRoutes');

const allowedOrigins = [
  'http://localhost:5173', 
  'https://warehouse-drab.vercel.app' // Add your Vercel URL here
];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));// Critical: Allows React (port 3000) to talk to Node (port 5000)
app.use(express.json());

app.use('/api/waybills', waybillRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/manifest', manifestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));