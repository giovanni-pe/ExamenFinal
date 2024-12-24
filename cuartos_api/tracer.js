const { NodeSDK } = require('@opentelemetry/sdk-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Configura el exportador OTLP para HTTP
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces', // Dirección del colector OTLP
});

// Configura los recursos del servicio
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'cuartos-api', // Nombre del servicio
});

// Configuración del SDK de OpenTelemetry
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

// Inicia el SDK de OpenTelemetry
try {
  sdk.start();
  console.log('OpenTelemetry SDK started successfully');
} catch (err) {
  console.error('Error starting OpenTelemetry SDK:', err);
}

// Finaliza el SDK al cerrar la aplicación
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK:', error);
  } finally {
    process.exit(0);
  }
});
