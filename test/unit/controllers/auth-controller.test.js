import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../models/user-model.js";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../models/user-model.js");

describe("Auth Controller", () => {
  let login, register;
  let req, res, next;

  beforeAll(async () => {
    process.env.JWT_SECRET = "secret";

    const controller = await import("../../../controllers/auth-controller.js");
    login = controller.login;
    register = controller.register;
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("register", () => {
    it("debería crear un nuevo usuario y devolver sus datos", async () => {
      req.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
      });

      await register(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        username: "testuser",
        email: "test@example.com",
      });
    });
  });

  describe("login", () => {
    it("debería devolver un token si las credenciales son válidas", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      const mockUser = { id: 1, email: "test@example.com", password: "hashed" };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      await login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "test@example.com" },
        "secret",
        { expiresIn: "1h" }
      );
      expect(res.json).toHaveBeenCalledWith({ token: "fake-jwt-token" });
    });

    it("debería responder con 401 si las credenciales son inválidas", async () => {
      req.body = { email: "wrong@example.com", password: "wrongpass" };

      User.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Credenciales inválidas",
      });
    });
  });
});
