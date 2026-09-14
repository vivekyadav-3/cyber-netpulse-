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
        List<com.netpulse.model.IcmpProbe> probes = new ArrayList<>();

        int seq = 1;
        // Regex patterns for individual probe responses
        // IPv4 Windows: Reply from 142.250.193.14: bytes=32 time=19ms TTL=116
        Pattern winIpv4Reply = Pattern.compile("Reply from ([0-9.]+): bytes=(\\d+) time[=<]([0-9.]+)ms TTL=(\\d+)", Pattern.CASE_INSENSITIVE);
        // IPv6 Windows: Reply from 2404:6800:4000:100c::8b: time=116ms
        Pattern winIpv6Reply = Pattern.compile("Reply from ([0-9a-fA-F:]+): time[=<]([0-9.]+)ms", Pattern.CASE_INSENSITIVE);
        // Unix: 64 bytes from 142.250.193.14: icmp_seq=1 ttl=116 time=19.2 ms
        Pattern unixReplyPattern = Pattern.compile("(\\d+) bytes from ([^:]+): (?:icmp_seq=(\\d+) )?ttl=(\\d+) time=([0-9.]+) ms", Pattern.CASE_INSENSITIVE);

        for (String line : lines) {
            String trimmed = line.trim();
            Matcher win4Match = winIpv4Reply.matcher(trimmed);
            Matcher win6Match = winIpv6Reply.matcher(trimmed);
            Matcher unixMatch = unixReplyPattern.matcher(trimmed);

            if (win4Match.find()) {
                String respIp = win4Match.group(1).trim();
                int bytes = Integer.parseInt(win4Match.group(2));
                double rtt = Double.parseDouble(win4Match.group(3));
                int ttl = Integer.parseInt(win4Match.group(4));

                probes.add(com.netpulse.model.IcmpProbe.builder()
                        .sequenceNumber(seq++)
                        .requestType(8)   // RFC 792 ICMP Echo Request
                        .requestCode(0)
                        .payloadBytes(bytes)
                        .replyType(0)     // RFC 792 ICMP Echo Reply
                        .replyCode(0)
                        .ttl(ttl)
                        .rttMs(rtt)
                        .responderIp(respIp)
                        .successful(true)
                        .statusMessage("ICMP Echo Reply (Type 0, Code 0)")
                        .build());
            } else if (win6Match.find() && !trimmed.toLowerCase().contains("bytes=")) {
                String respIp = win6Match.group(1).trim();
                double rtt = Double.parseDouble(win6Match.group(2));

                probes.add(com.netpulse.model.IcmpProbe.builder()
                        .sequenceNumber(seq++)
                        .requestType(128) // RFC 4443 ICMPv6 Echo Request
                        .requestCode(0)
                        .payloadBytes(32)
                        .replyType(129)   // RFC 4443 ICMPv6 Echo Reply
                        .replyCode(0)
                        .ttl(null)
                        .rttMs(rtt)
                        .responderIp(respIp)
                        .successful(true)
                        .statusMessage("ICMPv6 Echo Reply (Type 129, Code 0)")
                        .build());
            } else if (unixMatch.find()) {
                int bytes = Integer.parseInt(unixMatch.group(1));
                String respIp = unixMatch.group(2).trim();
                int ttl = Integer.parseInt(unixMatch.group(4));
                double rtt = Double.parseDouble(unixMatch.group(5));
                boolean isV6 = respIp.contains(":");

                probes.add(com.netpulse.model.IcmpProbe.builder()
                        .sequenceNumber(seq++)
                        .requestType(isV6 ? 128 : 8)
                        .requestCode(0)
                        .payloadBytes(bytes)
                        .replyType(isV6 ? 129 : 0)
                        .replyCode(0)
                        .ttl(ttl)
                        .rttMs(rtt)
                        .responderIp(respIp)
                        .successful(true)
                        .statusMessage(isV6 ? "ICMPv6 Echo Reply (Type 129, Code 0)" : "ICMP Echo Reply (Type 0, Code 0)")
                        .build());
            } else if (trimmed.toLowerCase().contains("timed out") || trimmed.toLowerCase().contains("destination host unreachable")) {
                probes.add(com.netpulse.model.IcmpProbe.builder()
                        .sequenceNumber(seq++)
                        .requestType(8)
                        .requestCode(0)
                        .payloadBytes(32)
                        .replyType(trimmed.toLowerCase().contains("unreachable") ? 3 : null)
                        .replyCode(0)
                        .ttl(null)
                        .rttMs(null)
                        .responderIp(ip)
                        .successful(false)
                        .statusMessage(trimmed)
                        .build());
            }
        }

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
                .icmpProbes(probes)
                .build();
    }
}
