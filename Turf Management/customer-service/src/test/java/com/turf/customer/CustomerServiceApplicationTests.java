package com.turf.customer;

import com.turf.customer.aop.LoggingAspect;
import com.turf.customer.controller.AuthController;
import com.turf.customer.dto.CustomerDTO;
import com.turf.customer.dto.LoginRequestDTO;
import com.turf.customer.dto.RegisterRequestDTO;
import com.turf.customer.entity.Customer;
import com.turf.customer.entity.Role;
import com.turf.customer.repository.CustomerRepository;
import com.turf.customer.security.JwtUtil;
import com.turf.customer.service.AuthService;
import org.aspectj.lang.JoinPoint;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@TestPropertySource(properties = {
        "jwt.secret=mysecretkeymysecretkeymysecretkey123456"
})
class CustomerServiceApplicationTests {

    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkey123456";


    // ===============================
    // MAIN METHOD TEST
    // ===============================

    @Test
    void mainMethodRunsSuccessfully() {

        assertDoesNotThrow(() ->
                CustomerServiceApplication.main(new String[]{}));
    }


    // ===============================
    // SPRINGBOOT ANNOTATION TEST
    // ===============================

    @Test
    void springBootAnnotationPresent() {

        assertTrue(
                CustomerServiceApplication.class
                        .isAnnotationPresent(
                                SpringBootApplication.class
                        )
        );
    }


    // ===============================
    // ENTITY TEST
    // ===============================

    @Test
    void customerEntityTest() {

        Customer c = new Customer();

        c.setId(1L);
        c.setUsername("john");
        c.setPassword("123");
        c.setRole(Role.ROLE_CUSTOMER);

        assertEquals("john", c.getUsername());
        assertEquals("123", c.getPassword());
        assertEquals(Role.ROLE_CUSTOMER, c.getRole());
    }


    // ===============================
    // AUTH SERVICE REGISTER SUCCESS
    // ===============================

    @Test
    void registerSuccessTest() {

        CustomerRepository repo =
                mock(CustomerRepository.class);

        JwtUtil jwtUtil =
                new JwtUtil(SECRET);

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        AuthService service =
                new AuthService(repo, jwtUtil, encoder);

        RegisterRequestDTO request =
                new RegisterRequestDTO();

        request.setUsername("john");
        request.setPassword("123");
        request.setRole(Role.ROLE_CUSTOMER);

        Customer savedEntity = new Customer();
        savedEntity.setId(1L);
        savedEntity.setUsername("john");
        savedEntity.setPassword("encoded");
        savedEntity.setRole(Role.ROLE_CUSTOMER);

        when(repo.existsByUsername("john"))
                .thenReturn(false);

        when(repo.save(any(Customer.class)))
                .thenReturn(savedEntity);

        CustomerDTO result =
                service.register(request);

        assertEquals("john", result.getUsername());
    }


    // ===============================
    // REGISTER DUPLICATE USER TEST
    // ===============================

    @Test
    void registerDuplicateUserTest() {

        CustomerRepository repo =
                mock(CustomerRepository.class);

        JwtUtil jwtUtil =
                new JwtUtil(SECRET);

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        AuthService service =
                new AuthService(repo, jwtUtil, encoder);

        RegisterRequestDTO request =
                new RegisterRequestDTO();

        request.setUsername("john");

        when(repo.existsByUsername("john"))
                .thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> service.register(request));
    }


    // ===============================
    // LOGIN SUCCESS TEST
    // ===============================

    @Test
    void loginSuccessTest() {

        CustomerRepository repo =
                mock(CustomerRepository.class);

        JwtUtil jwtUtil =
                spy(new JwtUtil(SECRET));

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        AuthService service =
                new AuthService(repo, jwtUtil, encoder);

        Customer storedUser = new Customer();
        storedUser.setUsername("john");
        storedUser.setPassword(
                encoder.encode("123"));
        storedUser.setRole(Role.ROLE_CUSTOMER);

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setUsername("john");
        request.setPassword("123");

        when(repo.findByUsername("john"))
                .thenReturn(Optional.of(storedUser));

        String token =
                service.login(request);

        assertNotNull(token);
    }


    // ===============================
    // LOGIN USER NOT FOUND TEST
    // ===============================

    @Test
    void loginUserNotFoundTest() {

        CustomerRepository repo =
                mock(CustomerRepository.class);

        JwtUtil jwtUtil =
                new JwtUtil(SECRET);

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        AuthService service =
                new AuthService(repo, jwtUtil, encoder);

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setUsername("missing");

        when(repo.findByUsername("missing"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.login(request));
    }


    // ===============================
    // LOGIN INVALID PASSWORD TEST
    // ===============================

    @Test
    void loginInvalidPasswordTest() {

        CustomerRepository repo =
                mock(CustomerRepository.class);

        JwtUtil jwtUtil =
                new JwtUtil(SECRET);

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        AuthService service =
                new AuthService(repo, jwtUtil, encoder);

        Customer storedUser = new Customer();
        storedUser.setUsername("john");
        storedUser.setPassword(
                encoder.encode("123"));

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setUsername("john");
        request.setPassword("wrong");

        when(repo.findByUsername("john"))
                .thenReturn(Optional.of(storedUser));

        assertThrows(RuntimeException.class,
                () -> service.login(request));
    }


    // ===============================
    // JWT TOKEN VALIDATION TEST
    // ===============================

    @Test
    void jwtTokenValidationTest() {

        JwtUtil jwtUtil =
                new JwtUtil(SECRET);

        String token =
                jwtUtil.generateToken(
                        "john",
                        "ROLE_CUSTOMER"
                );

        assertEquals("john",
                jwtUtil.validateToken(token)
                        .getSubject());
    }


    // ===============================
    // CONTROLLER TEST
    // ===============================

    @Test
    void controllerEndpointsTest() {

        AuthService service =
                mock(AuthService.class);

        AuthController controller =
                new AuthController(service);

        RegisterRequestDTO request =
                new RegisterRequestDTO();

        request.setUsername("john");

        when(service.register(request))
                .thenReturn(
                        new CustomerDTO(
                                1L,
                                "john",
                                Role.ROLE_CUSTOMER
                        )
                );

        assertNotNull(
                controller.register(request)
        );
    }


    // ===============================
    // AOP ASPECT TEST
    // ===============================

    @Test
    void loggingAspectExecutionTest() {

        LoggingAspect aspect =
                new LoggingAspect();

        JoinPoint jp =
                mock(JoinPoint.class);

        assertDoesNotThrow(() ->
                aspect.controllerLog(jp));

        assertDoesNotThrow(() ->
                aspect.serviceLog(jp));

        assertDoesNotThrow(() ->
                aspect.exceptionLog(
                        jp,
                        new RuntimeException("error")
                ));
    }


    // ===============================
    // REFLECTION LOAD TEST
    // ===============================

    @Test
    void classLoadsSuccessfully() throws Exception {

        Class<?> clazz =
                Class.forName(
                        "com.turf.customer.CustomerServiceApplication"
                );

        assertNotNull(clazz);
    }
}