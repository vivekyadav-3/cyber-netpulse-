package com.netpulse.service;

import com.netpulse.model.PingResult;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PingService {

    public PingResult executePing(String host, int count) {
        // Sanitize host input to prevent command injection
        if (!host.matches("^[a-zA-Z0-9.-]+$")) {
            throw new IllegalArgumentException("Invalid host name or IP address format");
        }
        if (count <= 0 || count > 10) {
            count = 4;
        }

        List<String> outputLines = new ArrayList<>();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        // Windows uses '-n <count>', Linux/Unix uses '-c <count>'
        ProcessBuilder processBuilder = isWindows
                ? new ProcessBuilder("ping", "-n", String.valueOf(count), host)
                : new ProcessBuilder("ping", "-c", String.valueOf(count), host);

        try {
            String resolvedIp = "";
            try {
                resolvedIp = InetAddress.getByName(host).getHostAddress();
            } catch (Exception e) {
                resolvedIp = "Unresolved";
            }

            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().isEmpty()) {
                        outputLines.add(line);
                    }
                }
            }
            process.waitFor();

            return parsePingOutput(host, resolvedIp, count, outputLines, isWindows);

        } catch (Exception e) {
            return PingResult.builder()
                    .host(host)
                    .reachable(false)
                    .rawOutput(List.of("Error executing ping: " + e.getMessage()))
                    .build();
        }
    }

    private PingResult parsePingOutput(String host, String ip, int sent, List<String> lines, boolean isWindows) {
        int received = 0;
        double lossPercent = 100.0;
        Double minRtt = null;
        Double avgRtt = null;
        Double maxRtt = null;

        String fullOutput = String.join("\n", lines);

        if (isWindows) {
            // Match: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
            Pattern packetPattern = Pattern
                    .compile("Sent = (\\d+), Received = (\\d+), Lost = (\\d+) \\((\\d+)% loss\\)");
            Matcher packetMatcher = packetPattern.matcher(fullOutput);
            if (packetMatcher.find()) {
                received = Integer.parseInt(packetMatcher.group(2));
                lossPercent = Double.parseDouble(packetMatcher.group(4));
            }

            // Match: Minimum = 17ms, Maximum = 22ms, Average = 19ms
            Pattern rttPattern = Pattern.compile("Minimum = (\\d+)ms, Maximum = (\\d+)ms, Average = (\\d+)ms");
            Matcher rttMatcher = rttPattern.matcher(fullOutput);
            if (rttMatcher.find()) {
                minRtt = Double.parseDouble(rttMatcher.group(1));
                maxRtt = Double.parseDouble(rttMatcher.group(2));
                avgRtt = Double.parseDouble(rttMatcher.group(3));
            }
        } else {
            // Linux/macOS: 4 packets transmitted, 4 received, 0% packet loss
            Pattern packetPattern = Pattern.compile("(\\d+) packets transmitted, (\\d+) received");
            Matcher packetMatcher = packetPattern.matcher(fullOutput);
            if (packetMatcher.find()) {
                received = Integer.parseInt(packetMatcher.group(2));
                lossPercent = ((sent - received) / (double) sent) * 100.0;
            }

            // Linux/macOS: rtt min/avg/max/mdev = 14.123/15.456/18.789/1.234 ms
            Pattern rttPattern = Pattern.compile("rtt min/avg/max/[a-zA-Z]+ = ([0-9.]+)/([0-9.]+)/([0-9.]+)");
            Matcher rttMatcher = rttPattern.matcher(fullOutput);
            if (rttMatcher.find()) {
                minRtt = Double.parseDouble(rttMatcher.group(1));
                avgRtt = Double.parseDouble(rttMatcher.group(2));
                maxRtt = Double.parseDouble(rttMatcher.group(3));
            }
        }

        boolean reachable = received > 0;

        return PingResult.builder()
                .host(host)
                .ipAddress(ip)
                .packetsSent(sent)
                .packetsReceived(received)
                .packetLossPercent(lossPercent)
                .minRttMs(minRtt)
                .avgRttMs(avgRtt)
                .maxRttMs(maxRtt)
                .rawOutput(lines)
                .reachable(reachable)
                .build();
    }
}
