package com.netpulse.service;

import com.netpulse.model.ConnectionInfo;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConnectionService {

    public List<ConnectionInfo> getActiveConnections(String protocolFilter, int limit) {
        // Collect ALL first (no early break) so TCP lines don't consume the
        // limit before we reach UDP lines — netstat always outputs TCP before UDP.
        List<ConnectionInfo> all = new ArrayList<>();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        ProcessBuilder processBuilder = isWindows
                ? new ProcessBuilder("netstat", "-ano")
                : new ProcessBuilder("netstat", "-tunap");

        try {
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    ConnectionInfo info = parseNetstatLine(line, isWindows);
                    if (info != null) {
                        if (protocolFilter == null || protocolFilter.isEmpty()
                                || info.getProtocol().equalsIgnoreCase(protocolFilter)) {
                            all.add(info);
                        }
                    }
                }
            }
            process.waitFor();

        } catch (Exception e) {
            all.add(ConnectionInfo.builder()
                    .protocol("ERROR")
                    .state("Failed to retrieve connections: " + e.getMessage())
                    .build());
        }

        // Apply limit AFTER collecting everything — preserves both TCP and UDP
        return (limit > 0 && all.size() > limit) ? all.subList(0, limit) : all;
    }

    private ConnectionInfo parseNetstatLine(String line, boolean isWindows) {
        String trimmed = line.trim();
        if (trimmed.isEmpty() || trimmed.startsWith("Proto") || trimmed.startsWith("Active")) {
            return null;
        }

        // Split by whitespace
        String[] parts = trimmed.split("\\s+");

        if (isWindows) {
            // TCP Format: [Proto, Local Address, Foreign Address, State, PID]
            // Example: TCP 192.168.1.10:52740 142.250.78.14:443 ESTABLISHED 12480
            if (parts.length >= 5 && parts[0].equalsIgnoreCase("TCP")) {
                String[] local = splitAddressPort(parts[1]);
                String[] remote = splitAddressPort(parts[2]);
                return ConnectionInfo.builder()
                        .protocol(parts[0].toUpperCase())
                        .localAddress(local[0])
                        .localPort(parseIntOrDefault(local[1], 0))
                        .remoteAddress(remote[0])
                        .remotePort(parseIntOrDefault(remote[1], 0))
                        .state(parts[3])
                        .pid(parts[4])
                        .build();
            }

            // UDP Format: [Proto, Local Address, Foreign Address, PID]
            // Example: UDP 0.0.0.0:5353 *:* 4820
            if (parts.length >= 4 && parts[0].equalsIgnoreCase("UDP")) {
                String[] local = splitAddressPort(parts[1]);
                String[] remote = splitAddressPort(parts[2]);
                return ConnectionInfo.builder()
                        .protocol(parts[0].toUpperCase())
                        .localAddress(local[0])
                        .localPort(parseIntOrDefault(local[1], 0))
                        .remoteAddress(remote[0])
                        .remotePort(parseIntOrDefault(remote[1], 0))
                        .state("N/A")
                        .pid(parts[3])
                        .build();
            }
        }
        return null;
    }

    private String[] splitAddressPort(String addressPort) {
        int lastColon = addressPort.lastIndexOf(':');
        if (lastColon != -1) {
            String addr = addressPort.substring(0, lastColon);
            String port = addressPort.substring(lastColon + 1);
            return new String[] { addr, port };
        }
        return new String[] { addressPort, "0" };
    }

    private int parseIntOrDefault(String val, int defaultVal) {
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
