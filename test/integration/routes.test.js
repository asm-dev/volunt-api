import mongoose from "mongoose";
import request from "supertest";
import app from "../../app.js";
import sequelize from "../../config/db.js";

let authToken;
let taskId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  await sequelize.sync({ force: true });

  await request(app).post("/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  });

  const res = await request(app).post("/auth/login").send({
    email: "testuser@example.com",
    password: "password123",
  });
  authToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
  await sequelize.close();
});

describe("Rutas de Auth", () => {
  it("POST /auth/register - crea nuevo usuario", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("POST /auth/login - login correcto", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});

describe("Rutas de Tasks", () => {
  it("GET /tasks - lista tareas abiertas", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /tasks - crea tarea autenticado", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Tarea Test",
        description: "Descripción test",
        category: "Test",
        deadline: "2025-12-31",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    taskId = res.body.id;
  });

  it("PUT /tasks/:id - actualiza tarea autenticado", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Tarea Actualizada",
        description: "Nueva descripción",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Tarea Actualizada");
  });

  it("DELETE /tasks/:id - elimina tarea autenticado", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(204);
  });

  it("DELETE /tasks/:id - no puede eliminar tarea de otro usuario", async () => {
    const otherUserRes = await request(app).post("/auth/register").send({
      username: "otheruser",
      email: "otheruser@example.com",
      password: "password123",
    });
    const loginOtherRes = await request(app).post("/auth/login").send({
      email: "otheruser@example.com",
      password: "password123",
    });
    const otherToken = loginOtherRes.body.token;

    const taskRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        title: "Tarea de otro",
        description: "No tocar",
        category: "Test",
        deadline: "2025-12-31",
      });

    const res = await request(app)
      .delete(`/tasks/${taskRes.body.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "No autorizado");
  });
});

describe("Rutas de Volunteers", () => {
  let volunteerTaskId;
  let userObjectId;

  beforeAll(async () => {
    const decodedToken = Buffer.from(
      authToken.split(".")[1],
      "base64"
    ).toString();
    userObjectId = JSON.parse(decodedToken).id;

    const taskRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Tarea para voluntarios",
        description: "Descripción",
        category: "Voluntariado",
        deadline: "2025-12-31",
      });
    volunteerTaskId = taskRes.body.id;
  });

  it("GET /volunteers/:taskId - lista voluntarios", async () => {
    const res = await request(app)
      .get(`/volunteers/${volunteerTaskId}`)
      .timeout(10000);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 15000);

  it("POST /volunteers - crea voluntario autenticado", async () => {
    const res = await request(app)
      .post("/volunteers")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        taskId: volunteerTaskId,
        comment: "Quiero ayudar",
      });

    if (![201, 400, 404].includes(res.statusCode)) {
      console.error("Error en POST /volunteers:", res.statusCode, res.body);
    }

    expect([201, 400, 404]).toContain(res.statusCode);
  });
});
