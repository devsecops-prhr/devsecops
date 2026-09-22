package com.devsecops;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class AppTest {

    private final App app = new App();

    @Test
    void healthStatusReturnsOk() {
        assertEquals("ok", app.healthStatus());
    }

    @Test
    void greetingMentionsDevSecOps() {
        assertEquals("DevSecOps Java app", app.greeting());
    }

    @Test
    void serviceNameIsJava() {
        assertEquals("java", App.SERVICE);
    }
}
