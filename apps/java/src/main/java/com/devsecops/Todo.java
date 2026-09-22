package com.devsecops;

import java.util.UUID;

public class Todo {

    public static final int MAX_TITLE_LENGTH = 120;

    private final String id;
    private final String title;
    private boolean completed;

    public Todo(String title, boolean completed) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("O campo 'title' não pode ser vazio");
        }
        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("O campo 'title' deve ter no máximo " + MAX_TITLE_LENGTH + " caracteres");
        }
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.completed = completed;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
