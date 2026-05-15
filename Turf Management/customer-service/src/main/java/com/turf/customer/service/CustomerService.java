package com.turf.customer.service;

import com.turf.customer.dto.CustomerDTO;
import com.turf.customer.entity.Customer;
import com.turf.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerDTO> getAllCustomers() {

        return repository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public CustomerDTO getCustomerById(Long id) {

        Customer customer = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        return convertToDTO(customer);
    }

    private CustomerDTO convertToDTO(Customer customer) {

        return new CustomerDTO(
                customer.getId(),
                customer.getUsername(),
                customer.getRole()
        );
    }
}