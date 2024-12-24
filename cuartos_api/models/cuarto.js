const mongoose = require('mongoose');

const CuartoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  status: { type: String, required: true, enum: ['Disponible', 'Reservado', 'Pagado'] },
});

module.exports = mongoose.model('cuarto',CuartoSchema);
