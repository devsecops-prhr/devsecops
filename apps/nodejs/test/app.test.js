const request = require("supertest");
const app = require("../server");

describe("Node.js app - health", () => {
  it("responde 200 na rota /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("service", "nodejs");
  });
});

describe("Node.js app - todos CRUD", () => {
  it("cria uma tarefa", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Estudar Actions" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Estudar Actions");
    expect(res.body.completed).toBe(false);
  });

  it("lista tarefas", async () => {
    await request(app).post("/todos").send({ title: "Item A" });
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("valida título vazio", async () => {
    const res = await request(app).post("/todos").send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("valida título muito longo", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "x".repeat(121) });
    expect(res.status).toBe(400);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).get("/todos/inexistente");
    expect(res.status).toBe(404);
  });

  it("marca tarefa como concluída", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Fazer X" });
    const res = await request(app)
      .patch(`/todos/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("remove uma tarefa", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Remover" });
    const res = await request(app).delete(`/todos/${created.body.id}`);
    expect(res.status).toBe(204);
  });
});
