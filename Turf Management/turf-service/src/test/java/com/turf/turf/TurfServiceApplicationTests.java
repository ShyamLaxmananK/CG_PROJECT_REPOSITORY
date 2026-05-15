package com.turf.turf;

import com.turf.turf.aop.LoggingAspect;
import com.turf.turf.controller.TurfController;
import com.turf.turf.dto.TurfCreateRequestDTO;
import com.turf.turf.dto.TurfDTO;
import com.turf.turf.entity.Turf;
import com.turf.turf.exception.GlobalExceptionHandler;
import com.turf.turf.repository.TurfRepository;
import com.turf.turf.service.TurfService;
import org.aspectj.lang.JoinPoint;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class TurfServiceApplicationTests {

    @Test
    void mainRunsSuccessfully() {

        assertDoesNotThrow(() ->
                TurfServiceApplication.main(new String[]{}));
    }


    @Test
    void annotationPresentTest() {

        assertTrue(
                TurfServiceApplication.class
                        .isAnnotationPresent(SpringBootApplication.class)
        );
    }


    @Test
    void entityGetterSetterTest() {

        Turf turf = new Turf();

        turf.setId(1L);
        turf.setName("Elite Arena");
        turf.setLocation("Hyderabad");
        turf.setPricePerHour(1200.0);
        turf.setOwnerUsername("owner1");

        assertEquals("Elite Arena", turf.getName());
        assertEquals("Hyderabad", turf.getLocation());
        assertEquals("owner1", turf.getOwnerUsername());
        assertNotNull(turf.getCreatedAt());
    }


    @Test
    void addTurfSuccessTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        TurfCreateRequestDTO request =
                new TurfCreateRequestDTO();

        request.setName("Arena");
        request.setLocation("City");
        request.setPricePerHour(1000.0);

        Turf savedEntity = new Turf();

        when(repo.save(any())).thenReturn(savedEntity);

        TurfDTO result =
                service.addTurf(request, "owner1");

        assertNotNull(result);
    }


    @Test
    void addTurfHeaderMissingTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        TurfCreateRequestDTO request =
                new TurfCreateRequestDTO();

        assertThrows(RuntimeException.class,
                () -> service.addTurf(request, ""));
    }


    @Test
    void getAllTurfsSuccessTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        when(repo.findAll()).thenReturn(List.of(new Turf()));

        assertFalse(service.getAllTurfs().isEmpty());
    }


    @Test
    void getTurfByIdSuccessTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        Turf turf = new Turf();

        when(repo.findById(1L))
                .thenReturn(Optional.of(turf));

        assertNotNull(service.getTurfById(1L));
    }


    @Test
    void getTurfByIdFailureTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        when(repo.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.getTurfById(1L));
    }


    @Test
    void ownerTurfsSuccessTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        when(repo.findByOwnerUsername("owner1"))
                .thenReturn(List.of(new Turf()));

        assertFalse(service.getOwnerTurfs("owner1").isEmpty());
    }


    @Test
    void ownerTurfsHeaderMissingTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        assertThrows(RuntimeException.class,
                () -> service.getOwnerTurfs(""));
    }


    @Test
    void deleteSuccessTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        when(repo.existsByIdAndOwnerUsername(1L, "owner1"))
                .thenReturn(true);

        assertDoesNotThrow(() ->
                service.deleteTurf(1L, "owner1"));
    }


    @Test
    void deleteFailureTest() {

        TurfRepository repo = mock(TurfRepository.class);

        TurfService service = new TurfService(repo);

        when(repo.existsByIdAndOwnerUsername(1L, "owner1"))
                .thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> service.deleteTurf(1L, "owner1"));
    }


    @Test
    void controllerEndpointsTest() {

        TurfService service = mock(TurfService.class);

        TurfController controller =
                new TurfController(service);

        TurfCreateRequestDTO request =
                new TurfCreateRequestDTO();

        request.setName("Arena");
        request.setLocation("City");
        request.setPricePerHour(1000.0);

        when(service.addTurf(request, "owner1"))
                .thenReturn(
                        new TurfDTO(
                                1L,
                                "Arena",
                                "City",
                                1000.0,
                                "owner1"
                        )
                );

        ResponseEntity<TurfDTO> response =
                controller.addTurf(request, "owner1");

        assertNotNull(response.getBody());
    }


    @Test
    void globalExceptionHandlerTest() {

        GlobalExceptionHandler handler =
                new GlobalExceptionHandler();

        ResponseEntity<?> response =
                handler.handleRuntime(
                        new RuntimeException("error")
                );

        assertEquals(400,
                response.getStatusCode().value());
    }


    @Test
    void genericExceptionHandlerTest() {

        GlobalExceptionHandler handler =
                new GlobalExceptionHandler();

        ResponseEntity<?> response =
                handler.handleGeneric(
                        new Exception("error")
                );

        assertEquals(500,
                response.getStatusCode().value());
    }


    @Test
    void loggingAspectTest() {

        LoggingAspect aspect = new LoggingAspect();

        JoinPoint jp = mock(JoinPoint.class);

        assertDoesNotThrow(() ->
                aspect.controllerLog(jp));

        assertDoesNotThrow(() ->
                aspect.serviceLog(jp));

        assertDoesNotThrow(() ->
                aspect.exceptionLog(jp,
                        new RuntimeException("error")));
    }


    @Test
    void reflectionLoadTest() throws Exception {

        Class<?> clazz =
                Class.forName(
                        "com.turf.turf.TurfServiceApplication"
                );

        assertNotNull(clazz);
    }
}