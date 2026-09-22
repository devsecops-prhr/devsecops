import os
import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request

app = Flask(__name__)

todos: dict[str, dict] = {}

MAX_TITLE_LENGTH = 120


def validate_title(title):
    if not isinstance(title, str):
        return "O campo 'title' deve ser uma string"
    if not title.strip():
        return "O campo 'title' não pode ser vazio"
    if len(title.strip()) > MAX_TITLE_LENGTH:
        return f"O campo 'title' deve ter no máximo {MAX_TITLE_LENGTH} caracteres"
    return None


@app.get("/health")
def health():
    return jsonify(
        status="ok",
        service="flask",
        uptime=round(float(os.times()[4])),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/todos")
def list_todos():
    return jsonify(list(todos.values()))


@app.get("/todos/<todo_id>")
def get_todo(todo_id):
    todo = todos.get(todo_id)
    if todo is None:
        return jsonify(error="Tarefa não encontrada"), 404
    return jsonify(todo)


@app.post("/todos")
def create_todo():
    body = request.get_json(silent=True) or {}
    title = body.get("title")
    error = validate_title(title)
    if error:
        return jsonify(error=error), 400

    todo_id = uuid.uuid4().hex
    todo = {
        "id": todo_id,
        "title": title.strip(),
        "completed": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    todos[todo_id] = todo
    return jsonify(todo), 201


@app.patch("/todos/<todo_id>")
def update_todo(todo_id):
    todo = todos.get(todo_id)
    if todo is None:
        return jsonify(error="Tarefa não encontrada"), 404

    body = request.get_json(silent=True) or {}
    if "completed" in body:
        if not isinstance(body["completed"], bool):
            return jsonify(error="O campo 'completed' deve ser booleano"), 400
        todo["completed"] = body["completed"]
    if "title" in body:
        error = validate_title(body["title"])
        if error:
            return jsonify(error=error), 400
        todo["title"] = body["title"].strip()
    return jsonify(todo)


@app.delete("/todos/<todo_id>")
def delete_todo(todo_id):
    if todos.pop(todo_id, None) is None:
        return jsonify(error="Tarefa não encontrada"), 404
    return "", 204


@app.errorhandler(404)
def not_found(_):
    return jsonify(error="Rota não encontrada"), 404


@app.errorhandler(Exception)
def internal_error(_):
    return jsonify(error="Erro interno do servidor"), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
