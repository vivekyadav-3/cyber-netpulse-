package com.netpulse.controller;

import com.netpulse.model.DnsResult;
import com.netpulse.service.DnsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dns")
public class DnsController {

    private final DnsService dnsService;

    public DnsController(DnsService dnsService) {
        this.dnsService = dnsService;
    }

    @GetMapping
    public ResponseEntity<DnsResult> lookup(@RequestParam(defaultValue = "google.com") String host) {
        DnsResult result = dnsService.resolveDns(host);
        return ResponseEntity.ok(result);
    }
}
