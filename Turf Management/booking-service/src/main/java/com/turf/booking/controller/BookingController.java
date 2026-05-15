package com.turf.booking.controller;

import com.turf.booking.dto.BookingDTO;
import com.turf.booking.dto.BookingCreateRequestDTO;
import com.turf.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }


    @PostMapping("/create/{turfId}")
    public ResponseEntity<BookingDTO> createBooking(

            @PathVariable Long turfId,
            @RequestBody(required = false) BookingCreateRequestDTO request,
            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.createBooking(turfId, username, request));
    }


    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getBookings(

            @RequestHeader("X-User-Name") String username) {

        return ResponseEntity.ok(
                service.getCustomerBookings(username));
    }

    @GetMapping("/owner")
    public ResponseEntity<List<BookingDTO>> getOwnerBookings(
            @RequestHeader("X-User-Name") String ownerUsername) {

        return ResponseEntity.ok(
                service.getOwnerBookings(ownerUsername)
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {

        return ResponseEntity.ok(
                service.getAllBookings()
        );
    }


    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<String> cancelBooking(

            @PathVariable Long id,
            @RequestHeader("X-User-Name") String username) {

        service.cancelBooking(id, username);

        return ResponseEntity.ok("Booking cancelled");
    }

    @PatchMapping("/status/{id}/{status}")
    public ResponseEntity<BookingDTO> updateStatus(
            @PathVariable Long id,
            @PathVariable String status) {

        return ResponseEntity.ok(
                service.updateBookingStatus(id, status)
        );
    }
}
