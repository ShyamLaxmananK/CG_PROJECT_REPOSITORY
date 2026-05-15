package com.turf.booking.controller;

import com.turf.booking.entity.Booking;
import com.turf.booking.repository.BookingRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/slots")
public class SlotController {

    private static final List<String> DEFAULT_SLOTS = List.of(
            "06:00 - 07:00",
            "07:00 - 08:00",
            "08:00 - 09:00",
            "09:00 - 10:00",
            "17:00 - 18:00",
            "18:00 - 19:00"
    );

    private final BookingRepository bookingRepository;

    public SlotController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/{turfId}")
    public List<String> getSlotsByTurf(
            @PathVariable Long turfId
    ) {

        Set<String> bookedSlots = bookingRepository
                .findByTurfIdAndStatusNot(turfId, "CANCELLED")
                .stream()
                .map(Booking::getSlotTime)
                .filter(slot -> slot != null && !slot.isBlank())
                .collect(Collectors.toSet());

        return DEFAULT_SLOTS.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .toList();
    }
}
