package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EurekaServerApplicationTests {

    private final ApplicationContext context;

    EurekaServerApplicationTests(ApplicationContext context) {
        this.context = context;
    }

    /**
     * Test Spring context loads successfully
     */
    @Test
    void contextLoads() {

        assertNotNull(context);
    }


    /**
     * Test main method execution
     */
    @Test
    void mainMethodRuns() {

        assertDoesNotThrow(() ->
                EurekaServerApplication.main(
                        new String[]{}
                )
        );
    }


    /**
     * Verify @EnableEurekaServer annotation exists
     */
    @Test
    void enableEurekaServerAnnotationPresent() {

        assertTrue(
                EurekaServerApplication.class.isAnnotationPresent(
                        org.springframework.cloud.netflix.eureka.server.EnableEurekaServer.class
                )
        );
    }


    /**
     * Verify @SpringBootApplication annotation exists
     */
    @Test
    void springBootApplicationAnnotationPresent() {

        assertTrue(
                EurekaServerApplication.class.isAnnotationPresent(
                        org.springframework.boot.autoconfigure.SpringBootApplication.class
                )
        );
    }


    /**
     * Verify application class loads correctly
     */
    @Test
    void classLoadsSuccessfully() throws ClassNotFoundException {

        Class<?> clazz =
                Class.forName("com.example.demo.EurekaServerApplication");

        assertNotNull(clazz);
    }
}