import { sanitizeInputs } from "../../../middlewares/security-middleware.js";

describe("sanitizeInputs middleware", () => {
  let req, res, next;

  beforeEach(() => {
    res = {};
    next = jest.fn();
  });

  it("debería eliminar los caracteres < y > de los campos string", () => {
    req = {
      body: {
        name: "<script>alert('x')</script>",
        description: "algo > nada < todo",
        count: 42,
      },
    };

    sanitizeInputs(req, res, next);

    expect(req.body).toEqual({
      name: "scriptalert('x')/script",
      description: "algo  nada  todo",
      count: 42,
    });

    expect(next).toHaveBeenCalled();
  });

  it("debería pasar tal cual si no hay campos string", () => {
    req = {
      body: {
        count: 123,
        flag: true,
        nested: { a: "<b>" },
      },
    };

    sanitizeInputs(req, res, next);

    expect(req.body).toEqual({
      count: 123,
      flag: true,
      nested: { a: "<b>" },
    });

    expect(next).toHaveBeenCalled();
  });
});
