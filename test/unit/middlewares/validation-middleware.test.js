import { validationResult } from "express-validator";
import { validate } from "../../../middlewares/validation-middleware.js";

jest.mock("express-validator");

describe("validate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("debería responder con 400 y errores si hay errores de validación", () => {
    const fakeErrors = {
      isEmpty: () => false,
      array: () => [{ msg: "Error de validación" }],
    };

    validationResult.mockReturnValue(fakeErrors);

    validate(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: fakeErrors.array() });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería llamar a next si no hay errores", () => {
    const fakeErrors = {
      isEmpty: () => true,
      array: () => [],
    };

    validationResult.mockReturnValue(fakeErrors);

    validate(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
