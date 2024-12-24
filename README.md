# Proyecto de Microservicios y Microfrontends en DigitalOcean

Este proyecto está diseñado para implementar una solución escalable y modular basada en microservicios y microfrontends desplegados en la nube mediante DigitalOcean. La arquitectura emplea un enfoque moderno que facilita el desarrollo independiente de servicios y módulos de frontend, maximizando la reutilización de componentes y optimizando la observabilidad mediante herramientas avanzadas.

---

## Descripción de Alto Nivel

### Características Principales:
1. **Microservicios:**
   - **MS Products**: Servicio para gestionar productos, proporcionando endpoints para CRUD.
   - **MS Sales**: Servicio para gestionar las ventas y el historial transaccional.
   - Ambos servicios están containerizados con Docker y desplegados en instancias dentro de un VPC en DigitalOcean.

2. **Microfrontends:**
   - **Sales Chart**: Visualiza métricas y gráficos relacionados con ventas.
   - **Products Dashboard**: Permite la gestión y consulta del catálogo de productos.

3. **Observabilidad:**
   - **OpenTelemetry** se utiliza para instrumentar los servicios, mientras que **Jaeger** recolecta y visualiza trazas distribuidas para diagnosticar y optimizar el rendimiento.

4. **Infraestructura como Código (IaC):**
   - Terraform se usa para gestionar y desplegar la infraestructura en DigitalOcean, incluyendo VPC, subredes, y configuraciones de red necesarias.

---

## Video Explicativo

Aquí tienes un video que detalla la arquitectura, los componentes y el flujo de trabajo del proyecto:

[![Video Explicativo del Proyecto](https://img.youtube.com/vi/8sJ8AtnUwko/0.jpg)](https://youtu.be/8sJ8AtnUwko)


> **Nota:** Haz clic en la imagen para abrir el video en YouTube.

---

## Contacto

Si tienes dudas, preguntas o sugerencias, no dudes en abrir un issue en el repositorio o comunicarte con el equipo de desarrollo.
