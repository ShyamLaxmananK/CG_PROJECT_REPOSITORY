package com.turf.booking.repository;

import com.turf.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerUsernameOrderByBookingTimeDesc(String username);

    List<Booking> findByTurfIdAndStatusNot(Long turfId, String status);

    boolean existsByTurfIdAndSlotTimeAndStatusNot(
            Long turfId,
            String slotTime,
            String status
    );
}
