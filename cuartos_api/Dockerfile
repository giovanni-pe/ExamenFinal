# Etapa única: Imagen de ejecución
FROM node:20

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia todo el contenido del proyecto, incluidos los node_modules
COPY . .

# Expone el puerto de la aplicación
EXPOSE 5001

# Establece la variable de entorno para la URL del colector OTLP
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
ENV OTEL_SERVICE_NAME=sales-api

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
