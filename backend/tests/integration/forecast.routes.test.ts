/// <reference types="jest" />
import request from "supertest";
import { app } from "../../src/app";

jest.mock("../../src/config/database", () => ({
  supabase: { from: () => ({}) },
}));
jest.mock("../../src/services/forecast.service");
import {
  getDailyForecasts,
  getHourlyForecasts,
} from "../../src/services/forecast.service";
const mockGetDaily = getDailyForecasts as jest.Mock<any>;
const mockGetHourly = getHourlyForecasts as jest.Mock<any>;

describe("Forecast routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET /api/forecasts/:locationId returns daily forecasts", async () => {
    mockGetDaily.mockResolvedValue([
      { id: "daily-1", forecast_date: "2026-05-03" },
    ]);
    const res = await request(app).get("/api/forecasts/loc-1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /api/forecasts/:locationId/hourly returns 400 without dailyId", async () => {
    const res = await request(app).get("/api/forecasts/loc-1/hourly");
    expect(res.status).toBe(400);
  });

  it("GET /api/forecasts/:locationId/hourly returns hourly data", async () => {
    mockGetHourly.mockResolvedValue([{ id: "h-1", hour: 0, temperature: 14 }]);
    const res = await request(app).get(
      "/api/forecasts/loc-1/hourly?dailyId=daily-1",
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
