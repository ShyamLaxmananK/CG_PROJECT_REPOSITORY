package com.turf.customer.dto;

import com.turf.customer.entity.Role;

public class CustomerDTO {

    private Long id;
    private String username;
    private Role role;

    public CustomerDTO(Long id,
                               String username,
                               Role role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() { return id; }

    public String getUsername() { return username; }

    public Role getRole() { return role; }
}