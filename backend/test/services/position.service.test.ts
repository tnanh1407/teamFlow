import pool from "../../src/config/database.js";
import positionService from "../../src/position/position.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

const mockQuery = jest.fn();

beforeEach(() => {
  (pool.query as jest.Mock) = mockQuery;
});

const fakePosition = {
  id: "pos-1",
  name: "Software Engineer",
  description: "Develops software",
  level: "Middle",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("PositionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all positions", async () => {
      mockQuery.mockResolvedValue({ rows: [fakePosition] });
      const result = await positionService.findAll();
      expect(result).toEqual([fakePosition]);
    });

    it("returns empty array", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await positionService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns position when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakePosition] });
      const result = await positionService.findById("pos-1");
      expect(result).toEqual(fakePosition);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await positionService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("returns position by name", async () => {
      mockQuery.mockResolvedValue({ rows: [fakePosition] });
      const result = await positionService.findByName("Software Engineer");
      expect(result).toEqual(fakePosition);
    });
  });

  describe("create", () => {
    const createData = { name: "Designer", description: "Designs UI", level: "Junior" };

    it("creates position successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakePosition, id: "pos-2", name: "Designer" }] });

      const result = await positionService.create(createData);
      expect(result).toBeDefined();
      expect(result.name).toBe("Designer");
    });

    it("throws 409 when name already exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakePosition] });
      await expect(positionService.create(createData)).rejects.toThrow(
        new AppError("Position name already exists", 409)
      );
    });
  });

  describe("update", () => {
    it("updates position successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakePosition, name: "Senior Engineer" }] });

      const result = await positionService.update("pos-1", { name: "Senior Engineer" });
      expect(result).toBeDefined();
      expect(result!.name).toBe("Senior Engineer");
    });

    it("throws 409 when name conflicts", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...fakePosition, id: "other-pos", name: "Existing" }],
      });
      await expect(
        positionService.update("pos-1", { name: "Existing" })
      ).rejects.toThrow(new AppError("Position name already exists", 409));
    });

    it("returns null when not found", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const result = await positionService.update("nonexistent", { name: "New" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes position successfully", async () => {
      mockQuery.mockResolvedValue({ rows: [fakePosition] });
      const result = await positionService.delete("pos-1");
      expect(result).toEqual(fakePosition);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await positionService.delete("nonexistent");
      expect(result).toBeNull();
    });
  });
});
