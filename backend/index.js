const express = require('express');
const cors = require('cors');
const waybillRoutes = require('./routes/waybillRoutes');

const app = express();
app.use(cors()); // Critical: Allows React (port 3000) to talk to Node (port 5000)
app.use(express.json());

app.use('/api/waybills', waybillRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));