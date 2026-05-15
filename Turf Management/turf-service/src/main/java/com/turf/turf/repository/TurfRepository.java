package com.turf.turf.repository;

import com.turf.turf.entity.Turf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurfRepository extends JpaRepository<Turf, Long> {

    List<Turf> findByOwnerUsername(String ownerUsername);

    boolean existsByIdAndOwnerUsername(Long id, String ownerUsername);
}