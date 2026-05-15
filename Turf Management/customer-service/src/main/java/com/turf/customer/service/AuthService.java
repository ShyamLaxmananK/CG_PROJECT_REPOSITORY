package com.turf.customer.service;

import com.turf.customer.dto.CustomerDTO;
import com.turf.customer.dto.LoginRequestDTO;
import com.turf.customer.dto.RegisterRequestDTO;
import com.turf.customer.entity.Customer;
import com.turf.customer.repository.CustomerRepository;
import com.turf.customer.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final CustomerRepository repository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(CustomerRepository repository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public CustomerDTO register(RegisterRequestDTO request) {

        if (repository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Customer customer = new Customer();

        customer.setUsername(request.getUsername());

        // 🔐 encode password before saving
        customer.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        customer.setRole(request.getRole());

        Customer saved = repository.save(customer);

        return new CustomerDTO(
                saved.getId(),
                saved.getUsername(),
                saved.getRole()
        );
    }

    public String login(LoginRequestDTO request) {

        Customer user =
                repository.findByUsername(request.getUsername())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        // 🔐 correct password comparison
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name());
    }
}