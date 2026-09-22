const request = require("supertest");
const app = require("../server");

describe("Node.js app", () => {
  it("responde 200 na rota /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("service", "nodejs");
  });

  it("responde 200 na rota raiz", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("DevSecOps");
  });
});
