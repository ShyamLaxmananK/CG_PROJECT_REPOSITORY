package com.turf.booking;

import com.turf.booking.aop.LoggingAspect;
import com.turf.booking.client.TurfClient;
import com.turf.booking.controller.BookingController;
import com.turf.booking.controller.SlotController;
import com.turf.booking.dto.BookingCreateRequestDTO;
import com.turf.booking.dto.BookingDTO;
import com.turf.booking.dto.TurfSummaryDTO;
import com.turf.booking.entity.Booking;
import com.turf.booking.exception.ApiError;
import com.turf.booking.exception.GlobalExceptionHandler;
import com.turf.booking.repository.BookingRepository;
import com.turf.booking.service.BookingService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false"
})
class BookingServiceApplicationTests {

    private TurfSummaryDTO mockTurf(Long id) {

        TurfSummaryDTO turf = new TurfSummaryDTO();
        turf.setId(id);
        turf.setName("Arena");
        turf.setOwnerUsername("owner1");
        turf.setLocation("City");
        turf.setPricePerHour(500.0);

        return turf;
    }

    private BookingCreateRequestDTO request() {

        BookingCreateRequestDTO dto =
                new BookingCreateRequestDTO();

        dto.setSlotTime("06:00 - 07:00");
        dto.setTurfId(1L);

        return dto;
    }

    @Test
    void mainRuns() {

        assertDoesNotThrow(() ->
                BookingServiceApplication.main(new String[]{}));
    }

    @Test
    void springBootAnnotationExists() {

        assertTrue(
                BookingServiceApplication.class
                        .isAnnotationPresent(SpringBootApplication.class));
    }

    @Test
    void bookingLifecycleTest() {

        Booking booking = new Booking();

        booking.setCustomerUsername("john");
        booking.setTurfId(1L);
        booking.onCreate();

        assertEquals("CREATED", booking.getStatus());
        assertNotNull(booking.getBookingTime());
    }

    @Test
    void createBookingSuccessTest() {

        BookingRepository repo = mock(BookingRepository.class);
        TurfClient turfClient = mock(TurfClient.class);

        when(turfClient.getTurfById(1L))
                .thenReturn(mockTurf(1L));

        when(repo.existsByTurfIdAndSlotTimeAndStatusNot(
                any(), any(), any()))
                .thenReturn(false);

        Booking saved = new Booking();
        saved.setTurfId(1L);
        saved.setCustomerUsername("john");
        saved.setSlotTime("06:00 - 07:00");

        when(repo.save(any()))
                .thenReturn(saved);

        BookingService service =
                new BookingService(repo, turfClient);

        BookingDTO dto =
                service.createBooking(
                        1L,
                        "john",
                        request());

        assertEquals("Arena", dto.getTurfName());
    }

    @Test
    void createBookingAlreadyBookedTest() {

        BookingRepository repo = mock(BookingRepository.class);
        TurfClient turfClient = mock(TurfClient.class);

        when(turfClient.getTurfById(1L))
                .thenReturn(mockTurf(1L));

        when(repo.existsByTurfIdAndSlotTimeAndStatusNot(
                any(), any(), any()))
                .thenReturn(true);

        BookingService service =
                new BookingService(repo, turfClient);

        assertThrows(RuntimeException.class,
                () -> service.createBooking(
                        1L,
                        "john",
                        request()));
    }

    @Test
    void createBookingMissingSlotTest() {

        BookingRepository repo = mock(BookingRepository.class);
        TurfClient turfClient = mock(TurfClient.class);

        BookingService service =
                new BookingService(repo, turfClient);

        assertThrows(RuntimeException.class,
                () -> service.createBooking(
                        1L,
                        "john",
                        new BookingCreateRequestDTO()));
    }

    @Test
    void getCustomerBookingsTest() {

        BookingRepository repo = mock(BookingRepository.class);
        TurfClient turfClient = mock(TurfClient.class);

        Booking booking = new Booking();
        booking.setTurfId(1L);

        when(repo.findByCustomerUsernameOrderByBookingTimeDesc("john"))
                .thenReturn(List.of(booking));

        when(turfClient.getAllTurfs())
                .thenReturn(List.of(mockTurf(1L)));

        BookingService service =
                new BookingService(repo, turfClient);

        assertFalse(
                service.getCustomerBookings("john").isEmpty());
    }

    @Test
    void getOwnerBookingsTest() {

        BookingRepository repo = mock(BookingRepository.class);
        TurfClient turfClient = mock(TurfClient.class);

        Booking booking = new Booking();
        booking.setTurfId(1L);

        when(repo.findAll()).thenReturn(List.of(booking));
        when(turfClient.getAllTurfs())
                .thenReturn(List.of(mockTurf(1L)));

        BookingService service =
                new BookingService(repo, turfClient);

        assertEquals(1,
                service.getOwnerBookings("owner1").size());
    }

    @Test
    void cancelBookingUnauthorizedTest() {

        BookingRepository repo = mock(BookingRepository.class);

        Booking booking = new Booking();
        booking.setCustomerUsername("owner");

        when(repo.findById(1L))
                .thenReturn(Optional.of(booking));

        BookingService service =
                new BookingService(repo, mock());

        assertThrows(RuntimeException.class,
                () -> service.cancelBooking(1L, "john"));
    }

    @Test
    void cancelBookingSuccessTest() {

        BookingRepository repo = mock(BookingRepository.class);

        Booking booking = new Booking();
        booking.setCustomerUsername("john");

        when(repo.findById(1L))
                .thenReturn(Optional.of(booking));

        BookingService service =
                new BookingService(repo, mock());

        service.cancelBooking(1L, "john");

        assertEquals("CANCELLED",
                booking.getStatus());
    }

    @Test
    void updateStatusTest() {

        BookingRepository repo = mock(BookingRepository.class);

        Booking booking = new Booking();

        when(repo.findById(1L))
                .thenReturn(Optional.of(booking));

        when(repo.save(any()))
                .thenReturn(booking);

        BookingService service =
                new BookingService(repo, mock());

        BookingDTO dto =
                service.updateBookingStatus(1L,
                        "CONFIRMED");

        assertEquals("CONFIRMED",
                dto.getStatus());
    }

    @Test
    void controllerEndpointsTest() {

        BookingService service = mock(BookingService.class);

        BookingController controller =
                new BookingController(service);

        BookingDTO dto =
                new BookingDTO(
                        1L,
                        1L,
                        "Arena",
                        "john",
                        "06:00 - 07:00",
                        "CREATED",
                        LocalDateTime.now());

        when(service.createBooking(any(), any(), any()))
                .thenReturn(dto);

        when(service.getCustomerBookings("john"))
                .thenReturn(List.of(dto));

        assertNotNull(
                controller.createBooking(
                        1L,
                        request(),
                        "john").getBody());

        assertFalse(
                controller.getBookings("john")
                        .getBody().isEmpty());
    }

    @Test
    void slotControllerTest() {

        BookingRepository repo = mock(BookingRepository.class);

        when(repo.findByTurfIdAndStatusNot(any(), any()))
                .thenReturn(List.of());

        SlotController controller =
                new SlotController(repo);

        assertEquals(6,
                controller.getSlotsByTurf(1L).size());
    }

    @Test
    void exceptionHandlerTest() {

        GlobalExceptionHandler handler =
                new GlobalExceptionHandler();

        ApiError error =
                handler.handleRuntime(
                        new RuntimeException("Fail"));

        assertEquals("Fail",
                error.getMessage());
    }

    @Test
    void loggingAspectTest() {

        LoggingAspect aspect =
                new LoggingAspect();

        JoinPoint joinPoint = mock(JoinPoint.class);
        Signature signature = mock(Signature.class);

        when(joinPoint.getSignature())
                .thenReturn(signature);

        assertDoesNotThrow(() ->
                aspect.logBefore(joinPoint));
    }
}