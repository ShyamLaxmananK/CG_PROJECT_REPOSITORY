package com.turf.payment.repository;

import com.turf.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment> findByUsername(String username);

    java.util.Optional<Payment> findByIdAndUsername(Long id, String username);
}
