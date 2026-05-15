package com.turf.payment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.turf.payment.client.BookingClient;
import com.turf.payment.dto.PaymentDTO;
import com.turf.payment.dto.PaymentRequestDTO;
import com.turf.payment.dto.PaymentVerificationRequestDTO;
import com.turf.payment.entity.Payment;
import com.turf.payment.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository repository;
    private final BookingClient bookingClient;
    private final String defaultProvider;
    private final String defaultCurrency;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public PaymentService(
            PaymentRepository repository,
            BookingClient bookingClient,
            @Value("${payment.provider:MOCK}") String defaultProvider,
            @Value("${payment.currency:INR}") String defaultCurrency,
            @Value("${payment.razorpay.key-id:}") String razorpayKeyId,
            @Value("${payment.razorpay.key-secret:}") String razorpayKeySecret) {
        this.repository = repository;
        this.bookingClient = bookingClient;
        this.defaultProvider = defaultProvider;
        this.defaultCurrency = defaultCurrency;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    public PaymentDTO createPaymentOrder(
            Long bookingId,
            PaymentRequestDTO request,
            String username) {

        validateAmount(request.getAmount());

        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setAmount(request.getAmount());
        payment.setUsername(username);
        payment.setCurrency(resolveCurrency(request.getCurrency()));
        payment.setProvider(resolveProvider(request.getProvider()));
        payment.setReceipt("booking-" + bookingId + "-" + System.currentTimeMillis());
        payment.setStatus("CREATED");

        if ("RAZORPAY".equals(payment.getProvider())) {
            createRazorpayOrder(payment);
        } else {
            payment.setProviderOrderId("mock_order_" + UUID.randomUUID());
        }

        return convertToDTO(repository.save(payment));
    }

    public PaymentDTO verifyPayment(
            Long paymentId,
            PaymentVerificationRequestDTO request,
            String username) {

        Payment payment = repository.findByIdAndUsername(paymentId, username)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            return convertToDTO(payment);
        }

        if ("RAZORPAY".equals(payment.getProvider())) {
            verifyRazorpayPayment(payment, request);
        } else {
            payment.setProviderPaymentId(
                    isBlank(request.getProviderPaymentId())
                            ? "mock_payment_" + UUID.randomUUID()
                            : request.getProviderPaymentId()
            );
            payment.setProviderSignature(request.getSignature());
            payment.setStatus("SUCCESS");
        }

        Payment savedPayment = repository.save(payment);
        syncBookingStatus(savedPayment);

        return convertToDTO(savedPayment);
    }

    public PaymentDTO getPayment(Long paymentId, String username) {
        Payment payment = repository.findByIdAndUsername(paymentId, username)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return convertToDTO(payment);
    }

    public List<PaymentDTO> getPaymentHistory(String username) {
        return repository.findByUsername(username)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    private void createRazorpayOrder(Payment payment) {
        ensureRazorpayConfigured();

        try {
            RazorpayClient razorpayClient =
                    new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", Math.round(payment.getAmount() * 100));
            orderRequest.put("currency", payment.getCurrency());
            orderRequest.put("receipt", payment.getReceipt());
            orderRequest.put("payment_capture", 1);

            Order order = razorpayClient.orders.create(orderRequest);
            payment.setProviderOrderId(order.get("id"));
        } catch (Exception ex) {
            throw new RuntimeException("Unable to create Razorpay order: " + ex.getMessage(), ex);
        }
    }

    private void verifyRazorpayPayment(
            Payment payment,
            PaymentVerificationRequestDTO request) {

        ensureRazorpayConfigured();

        if (isBlank(request.getProviderOrderId())
                || isBlank(request.getProviderPaymentId())
                || isBlank(request.getSignature())) {
            throw new RuntimeException("Razorpay verification details are required");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getProviderOrderId());
            options.put("razorpay_payment_id", request.getProviderPaymentId());
            options.put("razorpay_signature", request.getSignature());

            boolean valid =
                    Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!valid) {
                throw new RuntimeException("Invalid Razorpay signature");
            }

            payment.setProviderOrderId(request.getProviderOrderId());
            payment.setProviderPaymentId(request.getProviderPaymentId());
            payment.setProviderSignature(request.getSignature());
            payment.setStatus("SUCCESS");
        } catch (RuntimeException ex) {
            payment.setStatus("FAILED");
            repository.save(payment);
            throw ex;
        } catch (Exception ex) {
            payment.setStatus("FAILED");
            repository.save(payment);
            throw new RuntimeException("Unable to verify Razorpay payment: " + ex.getMessage(), ex);
        }
    }

    private PaymentDTO convertToDTO(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getBookingId(),
                payment.getUsername(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getProvider(),
                payment.getProviderOrderId(),
                payment.getProviderPaymentId(),
                "RAZORPAY".equals(payment.getProvider()) ? razorpayKeyId : null,
                payment.getStatus(),
                payment.getPaymentTime()
        );
    }

    private void syncBookingStatus(Payment payment) {
        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            return;
        }

        try {
            bookingClient.updateBookingStatus(
                    payment.getBookingId(),
                    "CONFIRMED"
            );
        } catch (Exception ex) {
            throw new RuntimeException(
                    "Payment was saved but booking confirmation could not be updated",
                    ex
            );
        }
    }

    private void validateAmount(Double amount) {
        if (amount == null || amount <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }
    }

    private String resolveCurrency(String currency) {
        return isBlank(currency) ? defaultCurrency.toUpperCase() : currency.toUpperCase();
    }

    private String resolveProvider(String provider) {
        return isBlank(provider) ? defaultProvider.toUpperCase() : provider.toUpperCase();
    }

    private void ensureRazorpayConfigured() {
        if (isBlank(razorpayKeyId) || isBlank(razorpayKeySecret)) {
            throw new RuntimeException("Razorpay credentials are not configured");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
