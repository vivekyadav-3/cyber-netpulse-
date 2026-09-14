package com.netpulse.controller;

import com.netpulse.model.TracerouteResult;
import com.netpulse.service.TracerouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/traceroute")
public class TracerouteController {

    private final TracerouteService tracerouteService;

    public TracerouteController(TracerouteService tracerouteService) {
        this.tracerouteService = tracerouteService;
    }

    @GetMapping
    public ResponseEntity<TracerouteResult> trace(
            @RequestParam(defaultValue = "8.8.8.8") String host,
            @RequestParam(defaultValue = "15") int maxHops) {

        try {
            TracerouteResult result = tracerouteService.executeTraceroute(host, maxHops);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    TracerouteResult.builder()
                            .host(host)
                            .reachedDestination(false)
                            .build());
        }
    }
}
