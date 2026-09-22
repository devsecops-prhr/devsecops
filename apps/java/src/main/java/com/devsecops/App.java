package com.devsecops;

public class App {

    public static final String SERVICE = "java";

    public String healthStatus() {
        return "ok";
    }

    public String greeting() {
        return "DevSecOps Java app";
    }

    public static void main(String[] args) {
        App app = new App();
        System.out.println("Service: " + SERVICE + " - status: " + app.healthStatus());
    }
}
