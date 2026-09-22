package com.devsecops;

public class App {

    public static void main(String[] args) {
        TodoService service = new TodoService();
        Todo todo = service.create("Estudar GitHub Actions");
        System.out.println("Criada tarefa: " + todo.getTitle() + " (id=" + todo.getId() + ")");
        service.updateCompleted(todo.getId(), true);
        System.out.println("Concluída: " + service.findById(todo.getId()).isCompleted());
    }
}
