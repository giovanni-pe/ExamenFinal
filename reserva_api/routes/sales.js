const express = require('express');
const { trace, context } = require('@opentelemetry/api');
const axios = require('axios');
const router = express.Router();
const Sale = require('../models/Sale');

// OpenTelemetry tracer
const tracer = trace.getTracer('sales-api');

// Configuración de la API de cuartos
const CUARTOS_API_URL = 'http://localhost:5001/cuartos';

// POST: Registrar una nueva venta y reservar el cuarto
router.post('/', async (req, res) => {
  const span = tracer.startSpan('POST /sales');
  context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const { date, value, cuartoId } = req.body;

      if (!date || !value || !cuartoId) {
        throw new Error('Fields "date", "value", and "cuartoId" are required');
      }

      // Llamar a la API para reservar el cuarto
      const cuartoResponse = await axios.patch(`${CUARTOS_API_URL}/${cuartoId}/reservar`);
      if (cuartoResponse.status !== 200) {
        throw new Error('Failed to reserve the room');
      }

      // Crear una nueva venta
      const newSale = new Sale({ date, value, cuartoId, status: 'Reservado' });
      const savedSale = await newSale.save();

      span.setAttributes({
        'http.method': 'POST',
        'http.route': '/sales',
        'http.status_code': 201,
      });
      res.status(201).json(savedSale);
    } catch (err) {
      span.recordException(err);
      span.setAttribute('http.status_code', 400);
      res.status(400).json({ message: err.message });
    } finally {
      span.end();
    }
  });
});

// PATCH: Pagar una venta y marcar el cuarto como pagado
router.patch('/:id/pay', async (req, res) => {
  const span = tracer.startSpan('PATCH /sales/:id/pay');
  context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const { id } = req.params;

      const sale = await Sale.findById(id);
      if (!sale) {
        res.status(404).json({ message: 'Sale not found' });
        return;
      }

      const cuartoResponse = await axios.patch(`${CUARTOS_API_URL}/${sale.cuartoId}/pagar`);
      if (cuartoResponse.status !== 200) {
        throw new Error('Failed to mark the room as paid');
      }

      sale.status = 'Paid';
      const updatedSale = await sale.save();

      span.setAttributes({
        'http.method': 'PATCH',
        'http.route': '/sales/:id/pay',
        'http.status_code': 200,
      });
      res.json(updatedSale);
    } catch (err) {
      span.recordException(err);
      span.setAttribute('http.status_code', 500);
      res.status(500).json({ message: err.message });
    } finally {
      span.end();
    }
  });
});

// GET: Todas las ventas individuales
router.get('/', async (req, res) => {
  const span = tracer.startSpan('GET /sales');
  context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const sales = await Sale.find();
      span.setAttributes({
        'http.method': 'GET',
        'http.route': '/sales',
        'http.status_code': 200,
      });
      res.json(sales);
    } catch (err) {
      span.recordException(err);
      span.setAttribute('http.status_code', 500);
      res.status(500).json({ message: err.message });
    } finally {
      span.end();
    }
  });
});

// DELETE: Eliminar todas las ventas
router.delete('/', async (req, res) => {
  const span = tracer.startSpan('DELETE /sales');
  context.with(trace.setSpan(context.active(), span), async () => {
    try {
      await Sale.deleteMany();
      span.setAttributes({
        'http.method': 'DELETE',
        'http.route': '/sales',
        'http.status_code': 204,
      });
      res.status(204).send();
    } catch (err) {
      span.recordException(err);
      span.setAttribute('http.status_code', 500);
      res.status(500).json({ message: err.message });
    } finally {
      span.end();
    }
  });
});

// DELETE: Eliminar una venta por ID
router.delete('/:id', async (req, res) => {
  const span = tracer.startSpan('DELETE /sales/:id');
  context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const { id } = req.params;
      const deletedSale = await Sale.findByIdAndDelete(id);

      if (!deletedSale) {
        span.setAttribute('http.status_code', 404);
        res.status(404).json({ message: 'Sale not found' });
      } else {
        span.setAttributes({
          'http.method': 'DELETE',
          'http.route': '/sales/:id',
          'http.status_code': 204,
        });
        res.status(204).send();
      }
    } catch (err) {
      span.recordException(err);
      span.setAttribute('http.status_code', 500);
      res.status(500).json({ message: err.message });
    } finally {
      span.end();
    }
  });
});
router.get('/:period', async (req, res) => {
  const span = tracer.startSpan(`GET /sales/${req.params.period}`);
  try {
    const { period } = req.params;
    const sales = await Sale.find();

    let stats = [];
    switch (period) {
      case 'week':
        stats = calculateWeeklyStats(sales);
        break;
      case 'month':
        stats = calculateMonthlyStats(sales);
        break;
      case 'year':
        stats = calculateYearlyStats(sales);
        break;
      case 'max':
        stats = calculateMaxPoints(sales);
        break;
      default:
        span.setAttribute('http.status_code', 400);
        res.status(400).json({ message: 'Invalid period' });
        span.end();
        return;
    }

    span.setAttributes({
      'http.method': 'GET',
      'http.route': `/sales/${period}`,
      'http.status_code': 200,
    });
    res.json(stats);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// GET: Todas las ventas individuales
router.get('/', async (req, res) => {
  const span = tracer.startSpan('GET /sales');
  try {
    const sales = await Sale.find();

    span.setAttributes({
      'http.method': 'GET',
      'http.route': '/sales',
      'http.status_code': 200,
    });
    res.json(sales);
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// DELETE: Eliminar todas las ventas
router.delete('/', async (req, res) => {
  const span = tracer.startSpan('DELETE /sales');
  try {
    await Sale.deleteMany();

    span.setAttributes({
      'http.method': 'DELETE',
      'http.route': '/sales',
      'http.status_code': 204,
    });
    res.status(204).send();
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// DELETE: Eliminar una venta por ID
router.delete('/:id', async (req, res) => {
  const span = tracer.startSpan(`DELETE /sales/${req.params.id}`);
  try {
    const { id } = req.params;
    const deletedSale = await Sale.findByIdAndDelete(id);

    if (!deletedSale) {
      span.setAttribute('http.status_code', 404);
      res.status(404).json({ message: 'Sale not found' });
    } else {
      span.setAttributes({
        'http.method': 'DELETE',
        'http.route': `/sales/${id}`,
        'http.status_code': 204,
      });
      res.status(204).send();
    }
  } catch (err) {
    span.recordException(err);
    span.setAttribute('http.status_code', 500);
    res.status(500).json({ message: err.message });
  } finally {
    span.end();
  }
});

// Helper Functions
function calculateWeeklyStats(sales) {
  const grouped = {};
  sales.forEach((sale) => {
    const week = getWeekOfYear(sale.date);
    grouped[week] = (grouped[week] || 0) + sale.value;
  });
  return Object.keys(grouped).map((week) => ({ week, value: grouped[week] }));
}

function calculateMonthlyStats(sales) {
  const grouped = {};
  sales.forEach((sale) => {
    const month = `${sale.date.getFullYear()}-${sale.date.getMonth() + 1}`;
    grouped[month] = (grouped[month] || 0) + sale.value;
  });
  return Object.keys(grouped).map((month) => ({ month, value: grouped[month] }));
}

function calculateYearlyStats(sales) {
  const grouped = {};
  sales.forEach((sale) => {
    const year = sale.date.getFullYear();
    grouped[year] = (grouped[year] || 0) + sale.value;
  });
  return Object.keys(grouped).map((year) => ({ year, value: grouped[year] }));
}

function calculateMaxPoints(sales) {
  return sales.sort((a, b) => b.value - a.value).slice(0, 5);
}

function getWeekOfYear(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}


module.exports = router;
