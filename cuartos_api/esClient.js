const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200', // URL de tu instancia de Elasticsearch
});

module.exports = esClient;
