import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../models/volunteer-model.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  },
}));

const Volunteer = (await import("../../../models/volunteer-model.js")).default;
const { registerVolunteer, getVolunteersByTask } = await import(
  "../../../controllers/volunteer-controller.js"
);

describe("Volunteer Controller", () => {
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
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("registerVolunteer", () => {
    it("registra un voluntario si no existe uno previo", async () => {
      req.body = { taskId: "task123", comment: "Disponible" };

      Volunteer.findOne.mockResolvedValue(null);
      Volunteer.create.mockResolvedValue({
        id: "vol123",
        taskId: "task123",
        userId: 1,
        comment: "Disponible",
      });

      await registerVolunteer(req, res, next);

      expect(Volunteer.findOne).toHaveBeenCalledWith({
        taskId: "task123",
        userId: 1,
      });

      expect(Volunteer.create).toHaveBeenCalledWith({
        taskId: "task123",
        userId: 1,
        comment: "Disponible",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: "vol123" })
      );
    });

    it("devuelve error si ya está registrado", async () => {
      req.body = { taskId: "task123" };

      Volunteer.findOne.mockResolvedValue({ id: "existing" });

      await registerVolunteer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ya estás inscrito a esta tarea",
      });
    });
  });

  describe("getVolunteersByTask", () => {
    it("devuelve voluntarios con datos del usuario", async () => {
      const volunteers = [
        {
          id: "vol1",
          taskId: "task123",
          userId: "user123",
          comment: "Quiero ayudar",
        },
      ];

      Volunteer.find.mockResolvedValue(volunteers);

      const req = { params: { taskId: "task123" } };
      const res = {
        json: jest.fn(),
      };
      const next = jest.fn();

      await getVolunteersByTask(req, res, next);

      expect(Volunteer.find).toHaveBeenCalledWith({ taskId: "task123" });
      expect(res.json).toHaveBeenCalledWith(volunteers);
    });
  });
});
