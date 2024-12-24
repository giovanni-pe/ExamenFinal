const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importar cors
const salesRouter = require('./routes/sales');
require('./tracer'); // Configuración de OpenTelemetry

const app = express();

// Middleware para habilitar CORS
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/sales', salesRouter);

// Conexión a MongoDB
mongoose
  .connect('mongodb+srv://gkpe24:gkpe24a@cluster0.ttoc36c.mongodb.net/salesdb?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sales API running on http://localhost:${PORT}`);
});
