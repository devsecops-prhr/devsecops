package com.devsecops;

public class App {

    public static void main(String[] args) {
        final TodoService service = new TodoService();
        final Todo todo = service.create("Estudar GitHub Actions");
        System.out.println("Criada tarefa: " + todo.getTitle() + " (id=" + todo.getId() + ")");
        service.updateCompleted(todo.getId(), true);
        System.out.println("Concluída: " + service.findById(todo.getId()).isCompleted());
    }
}
