package com.devsecops;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TodoService {

    private final Map<String, Todo> store = new ConcurrentHashMap<>();

    public List<Todo> list() {
        return new ArrayList<>(store.values());
    }

    public Todo findById(String id) {
        return store.get(id);
    }

    public Todo create(String title) {
        Todo todo = new Todo(title, false);
        store.put(todo.getId(), todo);
        return todo;
    }

    public Todo updateCompleted(String id, boolean completed) {
        Todo todo = store.get(id);
        if (todo == null) {
            return null;
        }
        todo.setCompleted(completed);
        return todo;
    }

    public boolean delete(String id) {
        return store.remove(id) != null;
    }

    public int size() {
        return store.size();
    }
}
