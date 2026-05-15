package com.turf.payment.controller;

import com.turf.payment.dto.PaymentDTO;
import com.turf.payment.dto.PaymentRequestDTO;
import com.turf.payment.dto.PaymentVerificationRequestDTO;
import com.turf.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/orders/{bookingId}")
    public ResponseEntity<PaymentDTO> createOrder(

            @PathVariable Long bookingId,
            @RequestBody PaymentRequestDTO request,
            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.createPaymentOrder(
                        bookingId,
                        request,
                        username
                )
        );
    }

    @PostMapping("/pay/{bookingId}")
    public ResponseEntity<PaymentDTO> pay(

            @PathVariable Long bookingId,
            @RequestBody PaymentRequestDTO request,
            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.createPaymentOrder(
                        bookingId,
                        request,
                        username
                )
        );
    }

    @PostMapping("/verify/{paymentId}")
    public ResponseEntity<PaymentDTO> verify(

            @PathVariable Long paymentId,
            @RequestBody PaymentVerificationRequestDTO request,
            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.verifyPayment(
                        paymentId,
                        request,
                        username
                )
        );
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentDTO> getPayment(

            @PathVariable Long paymentId,
            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.getPayment(paymentId, username)
        );
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentDTO>> history(

            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.getPaymentHistory(username)
        );
    }
}
