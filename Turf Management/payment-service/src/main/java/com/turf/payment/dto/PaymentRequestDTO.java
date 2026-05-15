package com.turf.payment.dto;

public class PaymentRequestDTO {

    private Double amount;
    private String currency;
    private String provider;

    public Double getAmount() { return amount; }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
