describe("errorHandler middleware", () => {
  let errorHandler;
  let req, res, next;

  beforeAll(async () => {
    const middleware = await import("../../../middlewares/error-middleware.js");
    errorHandler = middleware.errorHandler;
  });

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it("debería responder con 500 y mensaje genérico", () => {
    const fakeError = new Error("Algo ha fallado");

    errorHandler(fakeError, req, res, next);

    expect(console.error).toHaveBeenCalledWith(fakeError.stack);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error interno del servidor",
    });
  });
});
