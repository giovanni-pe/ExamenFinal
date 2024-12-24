# Use an official Node.js runtime as the base image
# Etapa 1: Construcción
FROM node:20 AS builder

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app


# Copia el resto del código fuente de la aplicación
COPY . .

EXPOSE 5000

# Establece la variable de entorno para la URL del colector OTLP
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317/v1/traces
ENV OTEL_SERVICE_NAME=sales-api


CMD ["node", "app.js"]