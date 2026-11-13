# VoluntAPI

VoluntAPI is a micro-volunteering platform built with Node.js, Express, Sequelize, Mongoose and Redis. It is designed to facilitate low-commitment tasks such as translations, design, CV review and more. The backend focuses on providing security, modularity, efficient caching and a scalable architecture.

This API is divided into several services with clear responsibilities. At the persistence level, it uses **PostgreSQL** with Sequelize for relational models (users and tasks), and **MongoDB** with Mongoose for more dynamic structures (volunteers and comments). The choice of both technologies reflects an approach adapted to the different types of data.

In addition, **Redis** is incorporated to cache public tasks, improving performance on heavily queried endpoints and reducing the load of direct database queries.

> [!NOTE]  
> It has been verified that deploying to a production environment would be completely viable using Heroku, where we spin up a PostgreSQL DB, Redis and connect to a Mongo cluster. Since, for security reasons, we would need to configure access via IP/VPN, and since there are no free add-ons on Heroku, I am not sharing the link in the repository as I will remove access to those add-ons in the near future.

## Technical features

- JWT authentication. Token-based security with expiration and middleware verification.
- Hashed passwords. We use Bcrypts to hash password data with a unique salt to protect credentials.
- Security middleware. Includes Helmet, manual sanitization and exhaustive data validation.
- Improved performance through caching. With Redys we allow TTL caching of tasks, which improves response time.
- Use of Docker containers. Eases development and production.
- Test coverage above 80%. Support for unit and integration tests with Jest and Supertest.
- CI/CD. Tests are run and a deploy to Heroku is made on push to main.

One of the main goals is to ensure **security**

- Authentication middleware to protect critical endpoints.
- Input validation with `express-validator`.
- XSS prevention and input sanitization.
- Use of JWT with 1-hour expiration.

## Installation and execution

### What do I need?

- Docker and Docker Compose
- Node.js 18+ (if you run it outside a Docker container)

### How do I start the application?

```bash
git clone https://github.com/asm-devo/voluntapi.git
cd voluntapi
cp .env.example .env
docker-compose up --build
```

![image](https://github.com/user-attachments/assets/4e8c2742-1116-4817-b11b-0f00cf7309c8)

We run `npm run dev` and the API will be available at [http://localhost:3000](http://localhost:3000).

![image](https://github.com/user-attachments/assets/0885bfad-4b22-418a-ac64-fd39b3f5212e)

Once the application is up, you can run the **tests** with `npm run test`:

![image](https://github.com/user-attachments/assets/201fd3f0-7ec6-408e-91f0-8650726184fe)

To **try out the API** I recommend importing the `docs/postman_collection.json` file into Postman, since it gives immediate access to all the endpoints with several examples of direct use.

The available **endpoints** are:

| Method | Route               | Description                    |
| ------ | ------------------- | ------------------------------ |
| POST   | /auth/register      | Register a new user            |
| POST   | /auth/login         | Log in (returns JWT)           |
| GET    | /tasks              | List public tasks              |
| POST   | /tasks              | Create task (requires JWT)     |
| PUT    | /tasks/:id          | Edit own task                  |
| DELETE | /tasks/:id          | Delete own task                |
| POST   | /volunteers         | Sign up for a task             |
| GET    | /volunteers/:taskId | View a task's volunteers       |


## Notes on the Docker image

This project uses the base image:

```dockerfile
FROM node:23-alpine
```

This choice is based on the need to minimize vulnerabilities in production environments. `*-alpine` images are based on Alpine Linux, a minimalist distribution with an extremely small attack surface. At the time this image was chosen, `node:23-alpine` had **0 known vulnerabilities** (0 critical, 0 high, 0 medium, 0 low), while other variants such as `node:slim` contained several minor vulnerabilities.

Besides improving security, using Alpine also reduces the image size, which benefits deployment speed, CI/CD and efficiency in container environments.

> To maintain compatibility with modules that require native compilation (such as `bcrypt`), basic build tools (`python3`, `make`, `g++`) are added during the build.

## Possible future iterations

- Admin panel
- Support for private or moderated tasks
- Automatic CI/CD with GitHub Actions
- Webhooks or email notifications
- Implement a like or voting system on tasks
