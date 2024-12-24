const mongoose = require('mongoose');
const cuarto = require('../../cuartos_api/models/cuarto');

const SaleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  cuartoId: { type: String, required: true},
  status: { type: String, required: true },
});

module.exports = mongoose.model('Sale', SaleSchema);
