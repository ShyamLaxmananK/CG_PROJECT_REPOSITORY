package com.turf.customer.controller;

import com.turf.customer.dto.CustomerDTO;
import com.turf.customer.dto.LoginRequestDTO;
import com.turf.customer.dto.RegisterRequestDTO;
import com.turf.customer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<CustomerDTO> register(
            @Valid @RequestBody RegisterRequestDTO request) {

        return ResponseEntity.ok(
                authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequestDTO request) {

        return ResponseEntity.ok(
                authService.login(request));
    }
}