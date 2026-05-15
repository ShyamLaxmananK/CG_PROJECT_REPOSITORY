package com.turf.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "BOOKING-SERVICE")
public interface BookingClient {

    @PatchMapping("/bookings/status/{bookingId}/{status}")
    void updateBookingStatus(
            @PathVariable("bookingId") Long bookingId,
            @PathVariable("status") String status
    );
}
