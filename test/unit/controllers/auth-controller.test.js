import { jest } from "@jest/globals";

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/user-model.js", () => ({
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const User = (await import("../../../models/user-model.js")).default;
const { login, register } = await import(
  "../../../controllers/auth-controller.js"
);

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = "secret";

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
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
        "supersecreto123",
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
