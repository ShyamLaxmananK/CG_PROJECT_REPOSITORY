package com.turf.booking.dto;

import java.time.LocalDateTime;

public class BookingDTO {

    private Long id;
    private Long turfId;
    private String turfName;
    private String customerUsername;
    private String slotTime;
    private String status;
    private LocalDateTime bookingTime;

    public BookingDTO(Long id,
                      Long turfId,
                      String turfName,
                      String customerUsername,
                      String slotTime,
                      String status,
                      LocalDateTime bookingTime) {

        this.id = id;
        this.turfId = turfId;
        this.turfName = turfName;
        this.customerUsername = customerUsername;
        this.slotTime = slotTime;
        this.status = status;
        this.bookingTime = bookingTime;
    }

    public Long getId() { return id; }

    public Long getTurfId() { return turfId; }

    public String getTurfName() { return turfName; }

    public String getCustomerUsername() {
        return customerUsername;
    }

    public String getSlotTime() {
        return slotTime;
    }

    public String getStatus() { return status; }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }
}
