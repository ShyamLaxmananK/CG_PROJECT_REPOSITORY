package com.turf.booking.client;

import com.turf.booking.dto.TurfSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "TURF-SERVICE")
public interface TurfClient {

    @GetMapping("/turfs/{id}")
    TurfSummaryDTO getTurfById(@PathVariable Long id);

    @GetMapping("/turfs")
    List<TurfSummaryDTO> getAllTurfs();
}
