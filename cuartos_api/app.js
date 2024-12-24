const express = require('express');
const mongoose = require('mongoose');
const cuartosRouter = require('./routes/cuartos');
const cors = require('cors');
const client = require('prom-client'); // Importar prom-client
require('./tracer'); // Importar la configuración de OpenTelemetry

const app = express();
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Registro global para Prometheus
const register = new client.Registry();

// Configuración de métricas básicas del sistema
client.collectDefaultMetrics({ register }); 

// Contador personalizado para solicitudes HTTP
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Cantidad total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Histograma para medir latencia de solicitudes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5] // Rangos de latencia
});

// Registrar métricas personalizadas en el registro global
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware para medir métricas personalizadas
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer(); // Inicia temporizador
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });

    end({ method: req.method, route: req.path, status: res.statusCode }); // Finaliza temporizador
  });
  next();
});

// Rutas
app.use('/cuartos', cuartosRouter);

// Endpoint para métricas de Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Conexión a MongoDB
mongoose
  .connect(
    'mongodb+srv://gkpe24:gkpe24a@cluster0.ttoc36c.mongodb.net/salesdb?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Iniciar el servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`cuartos API running on http://localhost:${PORT}`);
  console.log(`Prometheus metrics available at http://localhost:${PORT}/metrics`);
});
