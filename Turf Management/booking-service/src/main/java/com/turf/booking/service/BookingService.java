package com.turf.booking.service;

import com.turf.booking.client.TurfClient;
import com.turf.booking.dto.BookingCreateRequestDTO;
import com.turf.booking.dto.BookingDTO;
import com.turf.booking.dto.TurfSummaryDTO;
import com.turf.booking.entity.Booking;
import com.turf.booking.repository.BookingRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository repository;
    private final TurfClient turfClient;

    public BookingService(
            BookingRepository repository,
            TurfClient turfClient) {

        this.repository = repository;
        this.turfClient = turfClient;
    }


    public BookingDTO createBooking(
            Long turfId,
            String username,
            BookingCreateRequestDTO request) {

        TurfSummaryDTO turf = turfClient.getTurfById(turfId);
        String slotTime = request != null ? request.getSlotTime() : null;

        if (slotTime == null || slotTime.isBlank()) {
            throw new RuntimeException("Please select a time slot");
        }

        boolean alreadyBooked =
                repository.existsByTurfIdAndSlotTimeAndStatusNot(
                        turfId,
                        slotTime,
                        "CANCELLED"
                );

        if (alreadyBooked) {
            throw new RuntimeException("This time slot has already been booked");
        }

        Booking booking = new Booking();

        booking.setTurfId(turfId);
        booking.setCustomerUsername(username);
        booking.setSlotTime(slotTime);

        Booking saved =
                repository.save(booking);

        asyncBookingLog(saved.getId());

        return convert(saved, turf);
    }


    public List<BookingDTO> getCustomerBookings(
            String username) {

        Map<Long, TurfSummaryDTO> turfsById = loadTurfsById();

        return repository
                .findByCustomerUsernameOrderByBookingTimeDesc(username)
                .stream()
                .map(booking -> convert(
                        booking,
                        turfsById.get(booking.getTurfId())
                ))
                .toList();
    }

    public List<BookingDTO> getOwnerBookings(String ownerUsername) {

        Map<Long, TurfSummaryDTO> turfsById = loadTurfsById();

        return repository.findAll()
                .stream()
                .filter(booking -> {
                    TurfSummaryDTO turf = turfsById.get(booking.getTurfId());
                    return turf != null
                            && ownerUsername.equals(turf.getOwnerUsername());
                })
                .map(booking -> convert(
                        booking,
                        turfsById.get(booking.getTurfId())
                ))
                .toList();
    }

    public List<BookingDTO> getAllBookings() {

        Map<Long, TurfSummaryDTO> turfsById = loadTurfsById();

        return repository.findAll()
                .stream()
                .map(booking -> convert(
                        booking,
                        turfsById.get(booking.getTurfId())
                ))
                .toList();
    }


    public void cancelBooking(
            Long id,
            String username) {

        Booking booking =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"));

        if (!booking.getCustomerUsername()
                .equals(username)) {

            throw new RuntimeException(
                    "Unauthorized cancellation attempt");
        }

        booking.setStatus("CANCELLED");

        repository.save(booking);
    }

    public BookingDTO updateBookingStatus(
            Long id,
            String status) {

        Booking booking = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        booking.setStatus(status);

        return convert(repository.save(booking));
    }


    @Async
    public void asyncBookingLog(Long bookingId) {

        System.out.println(
                "Async booking confirmation for ID: "
                        + bookingId);
    }


    private BookingDTO convert(Booking booking) {
        return convert(booking, safeGetTurf(booking.getTurfId()));
    }

    private BookingDTO convert(Booking booking, TurfSummaryDTO turf) {

        return new BookingDTO(
                booking.getId(),
                booking.getTurfId(),
                turf != null ? turf.getName() : null,
                booking.getCustomerUsername(),
                booking.getSlotTime(),
                booking.getStatus(),
                booking.getBookingTime()
        );
    }

    private Map<Long, TurfSummaryDTO> loadTurfsById() {
        try {
            return turfClient.getAllTurfs()
                    .stream()
                    .collect(Collectors.toMap(
                            TurfSummaryDTO::getId,
                            Function.identity(),
                            (left, right) -> left
                    ));
        } catch (Exception ex) {
            return Map.of();
        }
    }

    private TurfSummaryDTO safeGetTurf(Long turfId) {
        try {
            return turfClient.getTurfById(turfId);
        } catch (Exception ex) {
            return null;
        }
    }
}
