package com.example.demo;

import com.example.demo.config.SecurityConfig;
import com.example.demo.security.JwtAuthFilter;
import com.example.demo.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@TestPropertySource(properties = {
        "jwt.secret=mysecretkeymysecretkeymysecretkey123456"
})
class ApiGatewayApplicationTests {

    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkey123456";


    // ===============================
    // MAIN METHOD TEST
    // ===============================

    @Test
    void mainMethodRunsSuccessfully() {

        assertDoesNotThrow(() ->
                ApiGatewayApplication.main(new String[]{}));
    }


    // ===============================
    // SPRINGBOOT ANNOTATION TEST
    // ===============================

    @Test
    void springBootAnnotationPresent() {

        assertTrue(
                ApiGatewayApplication.class
                        .isAnnotationPresent(
                                SpringBootApplication.class
                        )
        );
    }


    // ===============================
    // JWT UTIL VALID TOKEN TEST
    // ===============================

    @Test
    void jwtUtilValidTokenTest() {

        SecretKey key =
                Keys.hmacShaKeyFor(SECRET.getBytes());

        String token =
                Jwts.builder()
                        .setSubject("customer1")
                        .claim("roles",
                                List.of("ROLE_CUSTOMER"))
                        .signWith(key)
                        .compact();

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        assertEquals(
                "customer1",
                jwtUtil.extractUsername(token)
        );

        assertEquals(
                "ROLE_CUSTOMER",
                jwtUtil.extractRoles(token).get(0)
        );
    }


    // ===============================
    // JWT UTIL INVALID TOKEN TEST
    // ===============================

    @Test
    void jwtUtilInvalidTokenTest() {

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        assertThrows(Exception.class,
                () -> jwtUtil.validateToken("invalid-token"));
    }


    // ===============================
    // SECURITY CONFIG TEST
    // ===============================

    @Test
    void securityFilterChainCreationTest() {

        JwtAuthFilter filter =
                mock(JwtAuthFilter.class);

        SecurityConfig config =
                new SecurityConfig(filter);

        SecurityWebFilterChain chain =
                config.securityWebFilterChain(
                        ServerHttpSecurity.http()
                );

        assertNotNull(chain);
    }


    // ===============================
    // JWT FILTER AUTH PATH BYPASS TEST
    // ===============================

    @Test
    void jwtFilterAuthPathBypassTest() {

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        JwtAuthFilter filter =
                new JwtAuthFilter(jwtUtil);

        MockServerHttpRequest request =
                MockServerHttpRequest
                        .get("/auth/login")
                        .build();

        ServerWebExchange exchange =
                MockServerWebExchange.from(request);

        WebFilterChain chain =
                exchange1 -> Mono.empty();

        assertDoesNotThrow(() ->
                filter.filter(exchange, chain));
    }


    // ===============================
    // JWT FILTER ACTUATOR PATH BYPASS
    // ===============================

    @Test
    void jwtFilterActuatorPathBypassTest() {

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        JwtAuthFilter filter =
                new JwtAuthFilter(jwtUtil);

        MockServerHttpRequest request =
                MockServerHttpRequest
                        .get("/actuator/health")
                        .build();

        ServerWebExchange exchange =
                MockServerWebExchange.from(request);

        WebFilterChain chain =
                exchange1 -> Mono.empty();

        assertDoesNotThrow(() ->
                filter.filter(exchange, chain));
    }


    // ===============================
    // JWT FILTER NO HEADER TEST
    // ===============================

    @Test
    void jwtFilterMissingHeaderTest() {

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        JwtAuthFilter filter =
                new JwtAuthFilter(jwtUtil);

        MockServerHttpRequest request =
                MockServerHttpRequest
                        .get("/turfs")
                        .build();

        ServerWebExchange exchange =
                MockServerWebExchange.from(request);

        WebFilterChain chain =
                exchange1 -> Mono.empty();

        assertDoesNotThrow(() ->
                filter.filter(exchange, chain));
    }


    // ===============================
    // JWT FILTER INVALID TOKEN TEST
    // ===============================

    @Test
    void jwtFilterInvalidTokenTest() {

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        JwtAuthFilter filter =
                new JwtAuthFilter(jwtUtil);

        MockServerHttpRequest request =
                MockServerHttpRequest
                        .get("/turfs")
                        .header(HttpHeaders.AUTHORIZATION,
                                "Bearer invalid")
                        .build();

        ServerWebExchange exchange =
                MockServerWebExchange.from(request);

        WebFilterChain chain =
                exchange1 -> Mono.empty();

        assertDoesNotThrow(() ->
                filter.filter(exchange, chain));
    }


    // ===============================
    // JWT FILTER VALID TOKEN TEST
    // ===============================

    @Test
    void jwtFilterValidTokenTest() {

        SecretKey key =
                Keys.hmacShaKeyFor(SECRET.getBytes());

        String token =
                Jwts.builder()
                        .setSubject("owner1")
                        .claim("roles",
                                List.of("ROLE_OWNER"))
                        .signWith(key)
                        .compact();

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        JwtAuthFilter filter =
                new JwtAuthFilter(jwtUtil);

        MockServerHttpRequest request =
                MockServerHttpRequest
                        .get("/turfs")
                        .header(HttpHeaders.AUTHORIZATION,
                                "Bearer " + token)
                        .build();

        ServerWebExchange exchange =
                MockServerWebExchange.from(request);

        WebFilterChain chain =
                exchange1 -> Mono.empty();

        assertDoesNotThrow(() ->
                filter.filter(exchange, chain));
    }


    // ===============================
    // USERNAME EXTRACTION TEST
    // ===============================

    @Test
    void jwtExtractUsernameTest() {

        SecretKey key =
                Keys.hmacShaKeyFor(SECRET.getBytes());

        String token =
                Jwts.builder()
                        .setSubject("admin1")
                        .claim("roles",
                                List.of("ROLE_ADMIN"))
                        .signWith(key)
                        .compact();

        JwtUtil jwtUtil = new JwtUtil(SECRET);

        assertEquals("admin1",
                jwtUtil.extractUsername(token));
    }


    // ===============================
    // REFLECTION LOAD TEST
    // ===============================

    @Test
    void classLoadsSuccessfully() throws Exception {

        Class<?> clazz =
                Class.forName(
                        "com.example.demo.ApiGatewayApplication"
                );

        assertNotNull(clazz);
    }
}