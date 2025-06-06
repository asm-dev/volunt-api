# VoluntAPI

VoluntAPI es una plataforma de micro-voluntariado construida con Node.js, Express, Sequelize, Mongoose y Redis. Está diseñada para facilitar tareas de bajo compromiso como traducciones, diseño, revisión de CVs y más. El backend está enfocado en ofrecer seguridad, modularidad, cache eficiente y una arquitectura escalable.

Esta API se divide en varios servicios con responsabilidades claras. A nivel de persistencia, utiliza **PostgreSQL** con Sequelize para modelos relacionales (usuarios y tareas), y **MongoDB** con Mongoose para estructuras más dinámicas (voluntarios y comentarios). La elección de ambas tecnologías refleja un enfoque adaptado a los diferentes tipos de datos.

Además, se incorpora **Redis** para cachear tareas públicas, mejorando el rendimiento en endpoints muy consultados y reduciendo la carga de consultas directas a la base de datos.

> [!NOTE]  
> Se comprueba que el deploy a un entorno de producción sería completamente viable utilizando Heroku, donde levantamos una BD PostgreSQL, Redis y conectamos con un cluster de Mongo. Dado que por razones de seguridad deberíamos configurar accesos mediante IP/VPN y puesto que no hay add-ons gratuitos en Heroku, no comparto el link en el repositorio ya que eliminaré el acceso a dichos add-ons en el futuro cercano.

## Características técnicas

- Autenticación con JWT. Seguridad por token con expiración y verificación middleware.
- Contraseñas hasheadas. Usamos Bcrypts para hasear los datos de contraseñas con un salt único para proteger credenciales.
- Middleware de seguridad. Incluye Helmet, sanitización manual y validación exhaustiva de datos.
- Rendimiento mejorado mediante cache. Permitimos con Redys cache TTL de tareas, lo que mejora el tiempo de respuesta.
- Uso de contenedores Docker. Facilita el desarrollo y producción.
- Cobertura de test superior al 80%. Soporte para pruebas unitarias e integración con Jest y Supertest.
- CI/CD. Se ejecutan tests y hace un deploy a Heroku al hacer push a main.

Uno de los objetivos principales es asegurar la **seguridad**

- Middleware de autenticación para proteger endpoints críticos.
- Validación de entrada con `express-validator`.
- Prevención de XSS y sanitización de inputs.
- Uso de JWT con expiración de 1 hora.

## Instalación y ejecución

### ¿Qué necesito?

- Docker y Docker Compose
- Node.js 18+ (si lo ejecutas fuera de contenedor Docker)

### ¿Cómo levanto la aplicación?

```bash
git clone https://github.com/asm-devo/voluntapi.git
cd voluntapi
cp .env.example .env
docker-compose up --build
```

![image](https://github.com/user-attachments/assets/4e8c2742-1116-4817-b11b-0f00cf7309c8)

Ejecutamos `npm run dev` y la API estará disponible en [http://localhost:3000](http://localhost:3000).

![image](https://github.com/user-attachments/assets/0885bfad-4b22-418a-ac64-fd39b3f5212e)

Una vez levantada la aplicación, puedes ejecutar los **tests** con `npm run test`:

![image](https://github.com/user-attachments/assets/201fd3f0-7ec6-408e-91f0-8650726184fe)

Para **probar la API** te recomiendo importar el archivo `docs/postman_collection.json` en Postman, ya que permite acceso inmediato a todos los endpoints con varios ejemplos de uso directo.

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


## Notas sobre la imagen Docker

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
