const express = require("express");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const todos = new Map();

function validateTodo(title) {
  if (typeof title !== "string") {
    return "O campo 'title' deve ser uma string";
  }
  if (title.trim().length === 0) {
    return "O campo 'title' não pode ser vazio";
  }
  if (title.trim().length > 120) {
    return "O campo 'title' deve ter no máximo 120 caracteres";
  }
  return null;
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "nodejs",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/todos", (req, res) => {
  res.json(Array.from(todos.values()));
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Tarefa não encontrada" });
  }
  res.json(todo);
});

app.post("/todos", (req, res) => {
  const { title } = req.body || {};
  const error = validateTodo(title);
  if (error) {
    return res.status(400).json({ error });
  }
  const id = crypto.randomUUID();
  const todo = {
    id,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.set(id, todo);
  res.status(201).json(todo);
});

app.patch("/todos/:id", (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Tarefa não encontrada" });
  }
  const { completed, title } = req.body || {};
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "O campo 'completed' deve ser booleano" });
    }
    todo.completed = completed;
  }
  if (title !== undefined) {
    const error = validateTodo(title);
    if (error) {
      return res.status(400).json({ error });
    }
    todo.title = title.trim();
  }
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  if (!todos.delete(req.params.id)) {
    return res.status(404).json({ error: "Tarefa não encontrada" });
  }
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Node.js app listening on port ${port}`);
  });
}

module.exports = app;
