# VoluntAPI

VoluntAPI es una plataforma de micro-voluntariado construida con Node.js, Express, Sequelize, Mongoose y Redis. Está diseñada para facilitar tareas de bajo compromiso como traducciones, diseño, revisión de CVs y más. El backend está enfocado en ofrecer seguridad, modularidad, cache eficiente y una arquitectura escalable.

Esta API se divide en varios servicios con responsabilidades claras. A nivel de persistencia, utiliza **PostgreSQL** con Sequelize para modelos relacionales (usuarios y tareas), y **MongoDB** con Mongoose para estructuras más dinámicas (voluntarios y comentarios). La elección de ambas tecnologías refleja un enfoque adaptado a los diferentes tipos de datos.

Además, se incorpora **Redis** para cachear tareas públicas, mejorando el rendimiento en endpoints muy consultados y reduciendo la carga de consultas directas a la base de datos.

## Características técnicas

- **JWT Authentication**: Seguridad por token con expiración y verificación middleware.
- **Bcrypt**: Contraseñas hasheadas con salt único para proteger credenciales.
- **Middleware de Seguridad**: Incluye Helmet, sanitización manual y validación exhaustiva de datos.
- **Redis**: Cache TTL de tareas para mejorar el tiempo de respuesta.
- **Docker**: Contenerización total del proyecto para desarrollo y producción.
- **Testing**: Soporte para pruebas unitarias e integración con Jest y Supertest.
- **CI/CD Ready**: Preparado para GitHub Actions u otros workflows automáticos.

Uno de los objetivos principales es asegurar la **seguridad**

- Middleware de autenticación para proteger endpoints críticos.
- Validación de entrada con `express-validator`.
- Prevención de XSS y sanitización de inputs.
- Uso de JWT con expiración de 1 hora.

## Instalación y ejecución

### Requisitos

- Docker y Docker Compose
- Node.js 18+ (si lo ejecutas fuera de contenedor Docker)

### Pasos

```bash
git clone https://github.com/tu-usuario/voluntapi.git
cd voluntapi
cp .env.example .env
docker-compose up --build
```

La API estará disponible en [http://localhost:3000](http://localhost:3000)

---

## Endpoints principales

| Método | Ruta                | Descripción                    |
| ------ | ------------------- | ------------------------------ |
| POST   | /auth/register      | Registro de nuevo usuario      |
| POST   | /auth/login         | Inicio de sesión (retorna JWT) |
| GET    | /tasks              | Listar tareas públicas         |
| POST   | /tasks              | Crear tarea (requiere JWT)     |
| PUT    | /tasks/:id          | Editar tarea propia            |
| DELETE | /tasks/:id          | Eliminar tarea propia          |
| POST   | /volunteers         | Inscribirse a una tarea        |
| GET    | /volunteers/:taskId | Ver voluntarios de una tarea   |

---

## Pruebas

El objetivo es una cobertura de test mínima del 80%. Las pruebas cubren tanto funciones puras como endpoints protegidos. Puedes ejecutar los tests con `npm run test`

Si lo que deseas es probar la API en uso, puedes importar el archivo `docs/postman_collection.json` en Postman para tener acceso inmediato a todos los endpoints con varios ejemplos de uso.

## 🐳 Decisión sobre la imagen Docker

Este proyecto utiliza la imagen base:

```dockerfile
FROM node:23-alpine
```

Esta elección se fundamenta en la necesidad de minimizar las vulnerabilidades en entornos de producción. Las imágenes `*-alpine` están basadas en Alpine Linux, una distribución minimalista con una superficie de ataque extremadamente reducida. En el momento de elegir esta imagen, `node:23-alpine` presentaba **0 vulnerabilidades conocidas** (0 críticas, 0 altas, 0 medias, 0 bajas), mientras que otras versiones como `node:slim` contenían varias vulnerabilidades menores.

Además de mejorar la seguridad, el uso de Alpine también reduce el tamaño de la imagen, lo cual es beneficioso para la velocidad de despliegue, CI/CD y eficiencia en entornos de contenedores.

> Para mantener la compatibilidad con módulos que requieren compilación nativa (como `bcrypt`), se agregan herramientas básicas de compilación (`python3`, `make`, `g++`) durante la construcción.

## Posibles futuras iteraciones

- Panel de administración
- Soporte para tareas privadas o moderadas
- CI/CD automático con GitHub Actions
- Webhooks o notificaciones por email
- Implementar sistema de likes o votación en tareas
