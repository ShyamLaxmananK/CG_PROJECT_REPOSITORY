package com.turf.payment.dto;

import java.time.LocalDateTime;

public class PaymentDTO {

    private Long id;
    private Long bookingId;
    private String username;
    private Double amount;
    private String currency;
    private String provider;
    private String providerOrderId;
    private String providerPaymentId;
    private String checkoutKey;
    private String status;
    private LocalDateTime paymentTime;

    public PaymentDTO(Long id,
                      Long bookingId,
                      String username,
                      Double amount,
                      String currency,
                      String provider,
                      String providerOrderId,
                      String providerPaymentId,
                      String checkoutKey,
                      String status,
                      LocalDateTime paymentTime) {

        this.id = id;
        this.bookingId = bookingId;
        this.username = username;
        this.amount = amount;
        this.currency = currency;
        this.provider = provider;
        this.providerOrderId = providerOrderId;
        this.providerPaymentId = providerPaymentId;
        this.checkoutKey = checkoutKey;
        this.status = status;
        this.paymentTime = paymentTime;
    }

    public Long getId() { return id; }

    public Long getBookingId() { return bookingId; }

    public String getUsername() { return username; }

    public Double getAmount() { return amount; }

    public String getCurrency() { return currency; }

    public String getProvider() { return provider; }

    public String getProviderOrderId() { return providerOrderId; }

    public String getProviderPaymentId() { return providerPaymentId; }

    public String getCheckoutKey() { return checkoutKey; }

    public String getStatus() { return status; }

    public LocalDateTime getPaymentTime() { return paymentTime; }
}
