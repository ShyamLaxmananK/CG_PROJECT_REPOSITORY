package com.turf.turf.service;

import com.turf.turf.dto.TurfCreateRequestDTO;
import com.turf.turf.dto.TurfDTO;
import com.turf.turf.entity.Turf;
import com.turf.turf.repository.TurfRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TurfService {

    private final TurfRepository repository;

    public TurfService(TurfRepository repository) {
        this.repository = repository;
    }


    public TurfDTO addTurf(
            TurfCreateRequestDTO request,
            String ownerUsername) {

        if (ownerUsername == null || ownerUsername.isBlank()) {

            throw new RuntimeException(
                    "Gateway did not forward X-User-Name header"
            );
        }

        Turf turf = new Turf();

        turf.setName(request.getName());
        turf.setLocation(request.getLocation());
        turf.setPricePerHour(request.getPricePerHour());
        turf.setOwnerUsername(ownerUsername);

        return convert(repository.save(turf));
    }


    public List<TurfDTO> getAllTurfs() {

        return repository.findAll()
                .stream()
                .map(this::convert)
                .toList();
    }


    public TurfDTO getTurfById(Long id) {

        Turf turf = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Turf not found with id: " + id
                        ));

        return convert(turf);
    }


    public List<TurfDTO> getOwnerTurfs(String ownerUsername) {

        if (ownerUsername == null || ownerUsername.isBlank()) {

            throw new RuntimeException(
                    "Owner username missing from request header"
            );
        }

        return repository
                .findByOwnerUsername(ownerUsername)
                .stream()
                .map(this::convert)
                .toList();
    }


    public void deleteTurf(Long id, String ownerUsername) {

        if (ownerUsername == null || ownerUsername.isBlank()) {

            throw new RuntimeException(
                    "Owner username missing from request header"
            );
        }

        boolean exists =
                repository.existsByIdAndOwnerUsername(
                        id,
                        ownerUsername
                );

        if (!exists) {

            throw new RuntimeException(
                    "Turf not found OR you are not the owner"
            );
        }

        repository.deleteById(id);
    }


    private TurfDTO convert(Turf turf) {

        return new TurfDTO(
                turf.getId(),
                turf.getName(),
                turf.getLocation(),
                turf.getPricePerHour(),
                turf.getOwnerUsername()
        );
    }
}