/// <reference types="jest" />
import { describe, expect, it } from "@jest/globals";
import { logger } from "../../src/config/logger";

describe("logger", () => {
  it("should be a winston logger with info or silent level", () => {
    expect(logger).toBeDefined();
    expect(["info", "silent"]).toContain(logger.level);
  });

  it("should have log methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
  });
});
