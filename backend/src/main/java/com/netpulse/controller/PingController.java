package com.netpulse.controller;

import com.netpulse.model.PingResult;
import com.netpulse.service.PingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ping")
public class PingController {

    private final PingService pingService;

    public PingController(PingService pingService) {
        this.pingService = pingService;
    }

    @GetMapping
    public ResponseEntity<PingResult> ping(
            @RequestParam(defaultValue = "8.8.8.8") String host,
            @RequestParam(defaultValue = "4") int count) {

        try {
            PingResult result = pingService.executePing(host, count);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    PingResult.builder()
                            .host(host)
                            .reachable(false)
                            .build());
        }
    }
}
