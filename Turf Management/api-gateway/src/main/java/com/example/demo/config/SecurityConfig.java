package com.example.demo.config;

import com.example.demo.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http

                .cors(cors -> {})

                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                .securityContextRepository(
                        NoOpServerSecurityContextRepository.getInstance()
                )

                .authorizeExchange(exchange -> exchange

                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        .pathMatchers("/auth/**").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/payments/webhook/**").permitAll()

                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/webjars/**",
                                "/*/swagger-ui.html",
                                "/*/swagger-ui/**",
                                "/*/v3/api-docs/**",
                                "/*/webjars/**"
                        ).permitAll()

                        .pathMatchers("/turfs/add/**")
                        .hasAuthority("ROLE_OWNER")

                        .pathMatchers("/turfs/delete/**")
                        .hasAuthority("ROLE_OWNER")

                        .pathMatchers("/turfs/**")
                        .authenticated()

                        .pathMatchers("/slots/**")
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_OWNER", "ROLE_ADMIN")

                        .pathMatchers("/bookings/create/**", "/bookings/my/**", "/bookings/cancel/**")
                        .hasAuthority("ROLE_CUSTOMER")

                        .pathMatchers("/bookings/owner/**")
                        .hasAuthority("ROLE_OWNER")

                        .pathMatchers("/bookings/all/**")
                        .hasAuthority("ROLE_ADMIN")

                        .pathMatchers("/payments/orders/**", "/payments/verify/**", "/payments/history/**", "/payments/pay/**")
                        .hasAuthority("ROLE_CUSTOMER")

                        .pathMatchers("/customers/**")
                        .hasAuthority("ROLE_ADMIN")

                        .anyExchange().authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        SecurityWebFiltersOrder.AUTHENTICATION
                )

                .build();
    }
}
