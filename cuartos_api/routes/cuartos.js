const express = require('express');
const { trace } = require('@opentelemetry/api');
const router = express.Router();
const Cuarto = require('../models/cuarto');

const tracer = trace.getTracer('cuartos-api');
const esClient = require('../esClient'); 
// POST: Crear un nuevo cuarto
router.post('/', async (req, res) => {
  const span = tracer.startSpan('POST /cuartos');
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      throw new Error('Both "name" and "price" are required');
    }

    const newCuarto = new Cuarto({ name, price, description, status: 'Disponible' });
    const savedCuarto = await newCuarto.save();

    span.setAttributes({
      'http.method': 'POST',
      'http.route': '/cuartos',
      'http.status_code': 201,
    });
    res.status(201).json(savedCuarto);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 400);
    res.status(400).json({ message: err.message });
  } finally {
    span.end();
  }
});

// GET: Listar todos los cuartos
router.get('/', async (req, res) => {
  const span = tracer.startSpan('GET /cuartos');
  try {
    const cuartos = await Cuarto.find();

    span.setAttributes({
      'http.method': 'GET',
      'http.route': '/cuartos',
      'http.status_code': 200,
    });
    res.json(cuartos);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// GET: Obtener un cuarto por ID
router.get('/:id', async (req, res) => {
  const span = tracer.startSpan('GET /cuartos/:id');
  try {
    const { id } = req.params;
    const cuarto = await Cuarto.findById(id);

    if (!cuarto) {
      span.setAttribute('http.status_code', 404);
      res.status(404).json({ message: 'cuarto not found' });
      return;
    }
    

    span.setAttributes({
      'http.method': 'GET',
      'http.route': '/cuartos/:id',
      'http.status_code': 200,
    });
    res.json(cuarto);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// PATCH: Reservar un cuarto

router.patch('/:id/reservar', async (req, res) => {
  const span = tracer.startSpan('PATCH /cuartos/:id/reservar');
  try {
    const { id } = req.params;
    const cuarto = await Cuarto.findById(id);

    if (!cuarto) {
      res.status(404).json({ message: 'Cuarto not found' });
      return;
    }

    // Verificar si el cuarto ya está reservado
    if (cuarto.status === 'Reservado') {
      // Enviar log a Elasticsearch
      await esClient.index({
        index: 'cuartos-logs',
        document: {
          action: 'duplicated_reservation',
          cuartoId: id,
          status: cuarto.status,
          timestamp: new Date().toISOString(),
        },
      });

      res.status(400).json({ message: 'El cuarto ya está reservado.' });
      return;
    }

    // Actualizar el estado del cuarto
    cuarto.status = 'Reservado';
    const updatedCuarto = await cuarto.save();

    // Enviar log de reserva exitosa
    await esClient.index({
      index: 'cuartos-logs',
      document: {
        action: 'reservation',
        cuartoId: id,
        status: cuarto.status,
        timestamp: new Date().toISOString(),
      },
    });

    span.setAttributes({
      'http.method': 'PATCH',
      'http.route': '/cuartos/:id/reservar',
      'http.status_code': 200,
    });
    res.json(updatedCuarto);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// PATCH: Pagar un cuarto
router.patch('/:id/pagar', async (req, res) => {
  const span = tracer.startSpan('PATCH /cuartos/:id/pagar');
  try {
    const { id } = req.params;
    const cuarto = await Cuarto.findById(id);

    if (!cuarto) {
      res.status(404).json({ message: 'Cuarto not found' });
      return;
    }

    // Verificar si el cuarto ya está pagado
    if (cuarto.status === 'Pagado') {
      // Enviar log a Elasticsearch
      await esClient.index({
        index: 'cuartos-logs',
        document: {
          action: 'duplicated_payment',
          cuartoId: id,
          status: cuarto.status,
          timestamp: new Date().toISOString(),
        },
      });

      res.status(400).json({ message: 'El cuarto ya está pagado.' });
      return;
    }

    // Actualizar el estado del cuarto
    cuarto.status = 'Pagado';
    const updatedCuarto = await cuarto.save();

    // Enviar log de pago exitoso
    await esClient.index({
      index: 'cuartos-logs',
      document: {
        action: 'payment',
        cuartoId: id,
        status: cuarto.status,
        timestamp: new Date().toISOString(),
      },
    });

    span.setAttributes({
      'http.method': 'PATCH',
      'http.route': '/cuartos/:id/pagar',
      'http.status_code': 200,
    });
    res.json(updatedCuarto);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});


module.exports = router;
