import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import("jsonwebtoken")).default;
const { authenticate } = await import(
  "../../../middlewares/auth-middleware.js"
);

describe("authenticate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer valid.token.here",
      },
    };

    res = {
      sendStatus: jest.fn(),
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  it("debería pasar si el token es válido", () => {
    const userPayload = { id: 1, email: "test@example.com" };

    jwt.verify.mockReturnValue(userPayload);

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid.token.here",
      process.env.JWT_SECRET
    );
    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalled();
  });

  it("debería devolver 401 si no hay token", () => {
    req.headers.authorization = undefined;

    authenticate(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería devolver 403 si el token es inválido", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticate(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
