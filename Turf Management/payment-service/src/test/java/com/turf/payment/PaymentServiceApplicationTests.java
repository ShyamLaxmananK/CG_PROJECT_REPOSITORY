package com.turf.payment;

import com.turf.payment.aop.LoggingAspect;
import com.turf.payment.client.BookingClient;
import com.turf.payment.controller.PaymentController;
import com.turf.payment.dto.*;
import com.turf.payment.entity.Payment;
import com.turf.payment.exception.ApiError;
import com.turf.payment.exception.GlobalExceptionHandler;
import com.turf.payment.repository.PaymentRepository;
import com.turf.payment.service.PaymentService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceApplicationTests {

    private PaymentService service(
            PaymentRepository repo,
            BookingClient bookingClient,
            String provider,
            String currency,
            String key,
            String secret
    ) {
        return new PaymentService(
                repo,
                bookingClient,
                provider,
                currency,
                key,
                secret
        );
    }

    private PaymentRequestDTO validRequest() {
        PaymentRequestDTO request = new PaymentRequestDTO();
        request.setAmount(1000.0);
        request.setCurrency("INR");
        request.setProvider("MOCK");
        return request;
    }

    // ===============================
    // APPLICATION TESTS
    // ===============================

    @Test
    void mainRunsSuccessfully() {
        assertDoesNotThrow(() ->
                PaymentServiceApplication.main(new String[]{}));
    }

    @Test
    void annotationPresentTest() {
        assertTrue(
                PaymentServiceApplication.class
                        .isAnnotationPresent(SpringBootApplication.class)
        );
    }

    // ===============================
    // ENTITY TESTS
    // ===============================

    @Test
    void paymentEntityLifecycleTest() {

        Payment payment = new Payment();

        payment.onCreate();

        assertEquals("INITIATED", payment.getStatus());
        assertNotNull(payment.getPaymentTime());
    }

    @Test
    void paymentEntityGetterSetterCoverageTest() {

        Payment payment = new Payment();

        payment.setUsername("john");
        payment.setAmount(100.0);
        payment.setCurrency("INR");
        payment.setProvider("MOCK");
        payment.setProviderOrderId("order");
        payment.setProviderPaymentId("payment");
        payment.setProviderSignature("signature");
        payment.setReceipt("receipt");

        assertEquals("john", payment.getUsername());
        assertEquals("INR", payment.getCurrency());
        assertEquals("order", payment.getProviderOrderId());
        assertEquals("payment", payment.getProviderPaymentId());
        assertEquals("signature", payment.getProviderSignature());
        assertEquals("receipt", payment.getReceipt());
    }

    // ===============================
    // SERVICE TESTS
    // ===============================

    @Test
    void createPaymentOrderMockProviderTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        PaymentDTO dto =
                service.createPaymentOrder(1L, validRequest(), "john");

        assertEquals("MOCK", dto.getProvider());
        assertEquals("INR", dto.getCurrency());
        assertNotNull(dto.getProviderOrderId());
    }

    @Test
    void createPaymentInvalidAmountTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        PaymentRequestDTO request = new PaymentRequestDTO();
        request.setAmount(0.0);

        assertThrows(RuntimeException.class,
                () -> service.createPaymentOrder(1L, request, "john"));
    }

    @Test
    void defaultCurrencyAndProviderFallbackTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        PaymentRequestDTO request = new PaymentRequestDTO();
        request.setAmount(200.0);

        PaymentDTO dto =
                service.createPaymentOrder(1L, request, "john");

        assertEquals("MOCK", dto.getProvider());
        assertEquals("INR", dto.getCurrency());
    }

    @Test
    void verifyPaymentMockSuccessTriggersBookingUpdate() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        Payment payment = new Payment();
        payment.setUsername("john");
        payment.setProvider("MOCK");
        payment.setBookingId(1L);

        when(repo.findByIdAndUsername(1L, "john"))
                .thenReturn(Optional.of(payment));

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        PaymentDTO dto =
                service.verifyPayment(
                        1L,
                        new PaymentVerificationRequestDTO(),
                        "john"
                );

        verify(bookingClient)
                .updateBookingStatus(1L, "CONFIRMED");

        assertEquals("SUCCESS", dto.getStatus());
    }

    @Test
    void verifyPaymentAlreadySuccessTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        Payment payment = new Payment();
        payment.setUsername("john");
        payment.setStatus("SUCCESS");

        when(repo.findByIdAndUsername(1L, "john"))
                .thenReturn(Optional.of(payment));

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        PaymentDTO dto =
                service.verifyPayment(
                        1L,
                        new PaymentVerificationRequestDTO(),
                        "john"
                );

        assertEquals("SUCCESS", dto.getStatus());
    }

    @Test
    void verifyPaymentNotFoundTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        when(repo.findByIdAndUsername(any(), any()))
                .thenReturn(Optional.empty());

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        assertThrows(RuntimeException.class,
                () -> service.verifyPayment(
                        1L,
                        new PaymentVerificationRequestDTO(),
                        "john"
                ));
    }

    @Test
    void verifyPaymentBookingSyncFailureTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        Payment payment = new Payment();
        payment.setUsername("john");
        payment.setProvider("MOCK");
        payment.setBookingId(1L);

        when(repo.findByIdAndUsername(1L, "john"))
                .thenReturn(Optional.of(payment));

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        doThrow(new RuntimeException("sync failed"))
                .when(bookingClient)
                .updateBookingStatus(any(), any());

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        assertThrows(RuntimeException.class,
                () -> service.verifyPayment(
                        1L,
                        new PaymentVerificationRequestDTO(),
                        "john"
                ));
    }

    @Test
    void paymentHistoryTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        when(repo.findByUsername("john"))
                .thenReturn(List.of(new Payment()));

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        assertFalse(service.getPaymentHistory("john").isEmpty());
    }

    @Test
    void paymentHistoryEmptyTest() {

        PaymentRepository repo = mock(PaymentRepository.class);
        BookingClient bookingClient = mock(BookingClient.class);

        when(repo.findByUsername("john"))
                .thenReturn(List.of());

        PaymentService service =
                service(repo, bookingClient, "MOCK", "INR", "", "");

        assertTrue(service.getPaymentHistory("john").isEmpty());
    }

    // ===============================
    // CONTROLLER TESTS
    // ===============================

    @Test
    void controllerEndpointsTest() {

        PaymentService service = mock(PaymentService.class);

        PaymentController controller =
                new PaymentController(service);

        PaymentDTO dto =
                new PaymentDTO(
                        1L,
                        1L,
                        "john",
                        1000.0,
                        "INR",
                        "MOCK",
                        "order",
                        "payment",
                        null,
                        "SUCCESS",
                        LocalDateTime.now()
                );

        when(service.createPaymentOrder(any(), any(), any()))
                .thenReturn(dto);

        when(service.verifyPayment(any(), any(), any()))
                .thenReturn(dto);

        when(service.getPayment(any(), any()))
                .thenReturn(dto);

        when(service.getPaymentHistory(any()))
                .thenReturn(List.of(dto));

        assertEquals("SUCCESS",
                controller.createOrder(1L, validRequest(), "john")
                        .getBody().getStatus());

        assertEquals("SUCCESS",
                controller.pay(1L, validRequest(), "john")
                        .getBody().getStatus());

        assertEquals("SUCCESS",
                controller.verify(1L,
                        new PaymentVerificationRequestDTO(),
                        "john").getBody().getStatus());

        assertEquals("SUCCESS",
                controller.getPayment(1L, "john")
                        .getBody().getStatus());

        assertFalse(controller.history("john")
                .getBody().isEmpty());
    }

    // ===============================
    // EXCEPTION HANDLER TESTS
    // ===============================

    @Test
    void runtimeExceptionHandlerTest() {

        GlobalExceptionHandler handler =
                new GlobalExceptionHandler();

        ApiError error =
                handler.handleRuntimeException(
                        new RuntimeException("Payment failed")
                );

        assertEquals("Payment failed", error.getMessage());
    }

    @Test
    void apiErrorDtoTest() {

        ApiError error =
                new ApiError("Invalid payment");

        assertEquals("Invalid payment", error.getMessage());
    }

    // ===============================
    // LOGGING ASPECT TEST
    // ===============================

    @Test
    void loggingAspectExecutionTest() {

        LoggingAspect aspect =
                new LoggingAspect();

        JoinPoint joinPoint = mock(JoinPoint.class);
        Signature signature = mock(Signature.class);

        when(signature.toString())
                .thenReturn("methodSignature");

        when(joinPoint.getSignature())
                .thenReturn(signature);

        assertDoesNotThrow(() ->
                aspect.logBefore(joinPoint));
    }

    // ===============================
    // REFLECTION LOAD TEST
    // ===============================

    @Test
    void reflectionLoadTest() throws Exception {

        Class<?> clazz =
                Class.forName(
                        "com.turf.payment.PaymentServiceApplication"
                );

        assertNotNull(clazz);
    }
}

