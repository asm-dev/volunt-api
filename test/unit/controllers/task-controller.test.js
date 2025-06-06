import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../models/task-model.js", () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../config/redis.js", () => ({
  default: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
  },
}));

const Task = (await import("../../../models/task-model.js")).default;
const redisClient = (await import("../../../config/redis.js")).default;
const { getTasks, createTask, updateTask, deleteTask } = await import(
  "../../../controllers/task-controller.js"
);

describe("Task Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("getTasks", () => {
    it("devuelve tareas desde caché si existe", async () => {
      const cachedTasks = JSON.stringify([{ id: 1, title: "Cached Task" }]);
      redisClient.get.mockResolvedValue(cachedTasks);

      await getTasks(req, res, next);

      expect(redisClient.get).toHaveBeenCalledWith("tasks:public");
      expect(res.json).toHaveBeenCalledWith(JSON.parse(cachedTasks));
    });

    it("consulta la base si no hay caché y la guarda", async () => {
      redisClient.get.mockResolvedValue(null);
      Task.findAll.mockResolvedValue([{ id: 2, title: "DB Task" }]);

      await getTasks(req, res, next);

      expect(Task.findAll).toHaveBeenCalledWith({ where: { status: "open" } });
      expect(redisClient.setEx).toHaveBeenCalledWith(
        "tasks:public",
        1800,
        JSON.stringify([{ id: 2, title: "DB Task" }])
      );
      expect(res.json).toHaveBeenCalledWith([{ id: 2, title: "DB Task" }]);
    });
  });

  describe("createTask", () => {
    it("crea una nueva tarea y borra la caché", async () => {
      req.body = {
        title: "Nueva",
        description: "desc",
        category: "cat",
        deadline: "2025-06-30",
      };

      Task.create.mockResolvedValue({
        id: 3,
        ...req.body,
        status: "open",
        createdBy: 1,
      });

      await createTask(req, res, next);

      expect(Task.create).toHaveBeenCalledWith({
        ...req.body,
        status: "open",
        createdBy: 1,
      });
      expect(redisClient.del).toHaveBeenCalledWith("tasks:public");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
    });
  });

  describe("updateTask", () => {
    it("actualiza una tarea si es del usuario", async () => {
      const task = {
        id: 4,
        createdBy: 1,
        save: jest.fn(),
      };

      req.params.id = 4;
      req.body = { title: "Actualizada" };

      Task.findByPk.mockResolvedValue(task);

      await updateTask(req, res, next);

      expect(Task.findByPk).toHaveBeenCalledWith(4);
      expect(task.save).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith("tasks:public");
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("rechaza si el usuario no es el creador", async () => {
      Task.findByPk.mockResolvedValue({ id: 4, createdBy: 99 });

      req.params.id = 4;

      await updateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "No autorizado" });
    });
  });

  describe("deleteTask", () => {
    it("elimina una tarea si es del usuario", async () => {
      const task = {
        id: 5,
        createdBy: 1,
        destroy: jest.fn(),
      };

      req.params.id = 5;
      Task.findByPk.mockResolvedValue(task);

      await deleteTask(req, res, next);

      expect(task.destroy).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith("tasks:public");
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("rechaza si el usuario no es el creador", async () => {
      Task.findByPk.mockResolvedValue({ id: 5, createdBy: 2 });

      req.params.id = 5;

      await deleteTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "No autorizado" });
    });
  });
});
