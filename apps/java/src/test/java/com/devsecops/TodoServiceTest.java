package com.devsecops;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TodoServiceTest {

    private TodoService service;

    @BeforeEach
    void setUp() {
        service = new TodoService();
    }

    @Test
    void createReturnsTodoWithId() {
        Todo todo = service.create("Estudar Actions");
        assertNotNull(todo.getId());
        assertEquals("Estudar Actions", todo.getTitle());
        assertFalse(todo.isCompleted());
    }

    @Test
    void listReturnsCreatedTodos() {
        service.create("Item A");
        service.create("Item B");
        assertEquals(2, service.size());
        List<Todo> todos = service.list();
        assertEquals(2, todos.size());
    }

    @Test
    void findByIdReturnsNullWhenMissing() {
        assertNull(service.findById("inexistente"));
    }

    @Test
    void updateCompletedMarksTodoDone() {
        Todo todo = service.create("Fazer X");
        Todo updated = service.updateCompleted(todo.getId(), true);
        assertNotNull(updated);
        assertTrue(updated.isCompleted());
    }

    @Test
    void updateCompletedReturnsNullWhenMissing() {
        assertNull(service.updateCompleted("inexistente", true));
    }

    @Test
    void deleteRemovesTodo() {
        Todo todo = service.create("Remover");
        assertTrue(service.delete(todo.getId()));
        assertEquals(0, service.size());
        assertFalse(service.delete(todo.getId()));
    }

    @Test
    void createRejectsBlankTitle() {
        assertThrows(IllegalArgumentException.class, () -> service.create("   "));
    }

    @Test
    void createRejectsNullTitle() {
        assertThrows(IllegalArgumentException.class, () -> service.create(null));
    }

    @Test
    void createRejectsTooLongTitle() {
        assertThrows(IllegalArgumentException.class, () -> service.create("x".repeat(121)));
    }
}
