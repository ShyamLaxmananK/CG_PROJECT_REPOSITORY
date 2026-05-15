package com.example.demo.security;

import io.jsonwebtoken.Claims;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter implements WebFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            org.springframework.web.server.WebFilterChain chain) {

        String path =
                exchange.getRequest().getURI().getPath();

        if (path.startsWith("/auth") ||
            path.startsWith("/actuator")) {

            return chain.filter(exchange);
        }

        String authHeader =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null ||
            !authHeader.startsWith("Bearer ")) {

            return chain.filter(exchange);
        }

        String token = authHeader.substring(7);

        try {

            Claims claims =
                    jwtUtil.validateToken(token);

            String username =
                    claims.getSubject();

            List<?> rolesRaw =
                    claims.get("roles", List.class);

            List<SimpleGrantedAuthority> authorities =
                    rolesRaw.stream()
                            .map(Object::toString)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

            ServerWebExchange modifiedExchange =
                    exchange.mutate()
                            .request(exchange.getRequest()
                                    .mutate()
                                    .header("X-User-Name", username)
                                    .build())
                            .build();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

            return chain.filter(modifiedExchange)
                    .contextWrite(
                            ReactiveSecurityContextHolder
                                    .withAuthentication(auth)
                    );

        } catch (Exception e) {

            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }
    }
}