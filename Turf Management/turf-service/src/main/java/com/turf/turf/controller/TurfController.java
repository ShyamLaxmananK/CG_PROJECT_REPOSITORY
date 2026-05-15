package com.turf.turf.controller;

import com.turf.turf.dto.TurfCreateRequestDTO;
import com.turf.turf.dto.TurfDTO;
import com.turf.turf.service.TurfService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/turfs")
public class TurfController {

    private final TurfService service;

    public TurfController(TurfService service) {
        this.service = service;
    }


    @PostMapping("/add")
    public ResponseEntity<TurfDTO> addTurf(

            @Valid @RequestBody TurfCreateRequestDTO request,
            @RequestHeader("X-User-Name") String ownerUsername) {

        return ResponseEntity.ok(
                service.addTurf(request, ownerUsername)
        );
    }


    @GetMapping
    public ResponseEntity<List<TurfDTO>> getAllTurfs() {

        return ResponseEntity.ok(
                service.getAllTurfs()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<TurfDTO> getTurfById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getTurfById(id)
        );
    }


    @GetMapping("/owner")
    public ResponseEntity<List<TurfDTO>> getOwnerTurfs(
            @RequestHeader("X-User-Name") String ownerUsername) {

        return ResponseEntity.ok(
                service.getOwnerTurfs(ownerUsername)
        );
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTurf(

            @PathVariable Long id,
            @RequestHeader("X-User-Name") String ownerUsername) {

        service.deleteTurf(id, ownerUsername);

        return ResponseEntity.ok(
                "Turf deleted successfully"
        );
    }
}