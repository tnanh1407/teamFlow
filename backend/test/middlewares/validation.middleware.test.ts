import { z } from "zod";
import { validate } from "../../src/middlewares/validation.middleware.js";

const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0, "Age must be positive"),
  email: z.string().email("Invalid email").optional(),
});

describe("validate middleware", () => {
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("calls next with parsed data when body is valid", () => {
    req.body = { name: "John", age: 25 };
    const middleware = validate(testSchema);

    middleware(req, res, next);

    expect(req.body).toEqual({ name: "John", age: 25 });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 when body is missing required fields", () => {
    req.body = { name: "John" };
    const middleware = validate(testSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation error" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 with field-level errors", () => {
    req.body = { name: "", age: -1 };
    const middleware = validate(testSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "name" }),
          expect.objectContaining({ field: "age" }),
        ]),
      })
    );
  });

  it("returns 400 when email is invalid", () => {
    req.body = { name: "John", age: 25, email: "not-an-email" };
    const middleware = validate(testSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
        ]),
      })
    );
  });

  it("replaces req.body with parsed (defaults applied) data", () => {
    const schemaWithDefault = z.object({
      role: z.string().default("user"),
      name: z.string(),
    });
    req.body = { name: "John" };
    const middleware = validate(schemaWithDefault);

    middleware(req, res, next);

    expect(req.body).toEqual({ name: "John", role: "user" });
    expect(next).toHaveBeenCalled();
  });
});
