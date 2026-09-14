package com.netpulse.controller;

import com.netpulse.model.ConnectionInfo;
import com.netpulse.service.ConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping
    public ResponseEntity<List<ConnectionInfo>> getConnections(
            @RequestParam(required = false) String protocol,
            @RequestParam(defaultValue = "100") int limit) {
        List<ConnectionInfo> list = connectionService.getActiveConnections(protocol, limit);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<ConnectionInfo> all = connectionService.getActiveConnections(null, 500);

        long tcpCount = all.stream().filter(c -> "TCP".equalsIgnoreCase(c.getProtocol())).count();
        long udpCount = all.stream().filter(c -> "UDP".equalsIgnoreCase(c.getProtocol())).count();
        long establishedCount = all.stream().filter(c -> "ESTABLISHED".equalsIgnoreCase(c.getState())).count();
        long listeningCount = all.stream().filter(c -> "LISTENING".equalsIgnoreCase(c.getState())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalConnections", all.size());
        summary.put("tcpCount", tcpCount);
        summary.put("udpCount", udpCount);
        summary.put("establishedCount", establishedCount);
        summary.put("listeningCount", listeningCount);

        return ResponseEntity.ok(summary);
    }
}
