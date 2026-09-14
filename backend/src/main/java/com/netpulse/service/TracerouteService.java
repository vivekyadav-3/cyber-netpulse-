package com.netpulse.service;

import com.netpulse.model.TracerouteHop;
import com.netpulse.model.TracerouteResult;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TracerouteService {

    public TracerouteResult executeTraceroute(String host, int maxHops) {
        // Sanitize input
        if (host == null || !host.matches("^[a-zA-Z0-9.-]+$")) {
            throw new IllegalArgumentException("Invalid host name or IP address format");
        }
        if (maxHops <= 0 || maxHops > 30) {
            maxHops = 15; // default reasonable hop limit
        }

        long startTime = System.currentTimeMillis();
        List<String> rawOutput = new ArrayList<>();
        List<TracerouteHop> hops = new ArrayList<>();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        // Windows uses 'tracert -d -h <maxHops>', Unix uses 'traceroute -n -m
        // <maxHops>'
        ProcessBuilder processBuilder = isWindows
                ? new ProcessBuilder("tracert", "-d", "-h", String.valueOf(maxHops), host)
                : new ProcessBuilder("traceroute", "-n", "-m", String.valueOf(maxHops), host);

        String destinationIp = "";
        try {
            destinationIp = InetAddress.getByName(host).getHostAddress();
        } catch (Exception ignored) {
        }
        final String finalDestIp = destinationIp;

        try {
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().isEmpty()) {
                        rawOutput.add(line);
                        TracerouteHop hop = parseHopLine(line, isWindows, finalDestIp);
                        if (hop != null) {
                            hops.add(hop);
                        }
                    }
                }
            }
            process.waitFor();

            long duration = System.currentTimeMillis() - startTime;
            boolean reached = hops.stream()
                    .anyMatch(TracerouteHop::isDestination);

            return TracerouteResult.builder()
                    .host(host)
                    .destinationIp(destinationIp)
                    .totalHops(hops.size())
                    .hops(hops)
                    .executionTimeMs(duration)
                    .reachedDestination(reached)
                    .rawOutput(rawOutput)
                    .build();

        } catch (Exception e) {
            return TracerouteResult.builder()
                    .host(host)
                    .destinationIp(destinationIp)
                    .totalHops(0)
                    .hops(List.of())
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .reachedDestination(false)
                    .rawOutput(List.of("Error executing traceroute: " + e.getMessage()))
                    .build();
        }
    }

    private TracerouteHop parseHopLine(String line, boolean isWindows, String destIp) {
        String trimmed = line.trim();

        // Windows hop line format example:
        // 1 1 ms 1 ms 1 ms 192.168.1.1
        // 2 * * * Request timed out.
        if (isWindows) {
            Pattern pattern = Pattern.compile("^(\\d+)\\s+([<\\d*ms\\s]+)\\s+([a-zA-Z0-9.:_-]+|Request timed out\\.?)");
            Matcher matcher = pattern.matcher(trimmed);

            if (matcher.find()) {
                int hopNum = Integer.parseInt(matcher.group(1));
                String rttPart = matcher.group(2);
                String endPart = matcher.group(3);

                boolean timedOut = endPart.toLowerCase().contains("timed out") || rttPart.contains("* * *");
                List<Double> rtts = extractRtts(rttPart);

                String hopIp = timedOut ? "*" : endPart;
                boolean isDest = !timedOut && (destIp != null && !destIp.isEmpty() && destIp.equals(hopIp));
                Integer icmpType = timedOut ? null : (isDest ? 0 : 11);
                String action = timedOut
                        ? "Probe timed out (router silent or ICMP rate-limited)"
                        : (isDest
                                ? "Destination reached — Returned ICMP Type 0 Echo Reply"
                                : "TTL decremented from " + hopNum + " to 0 — Returned ICMP Type 11 Time Exceeded");

                return TracerouteHop.builder()
                        .hopNumber(hopNum)
                        .ttl(hopNum)
                        .ipAddress(hopIp)
                        .hostName(timedOut ? "Request timed out" : endPart)
                        .rtt1Ms(!rtts.isEmpty() ? rtts.get(0) : null)
                        .rtt2Ms(rtts.size() > 1 ? rtts.get(1) : null)
                        .rtt3Ms(rtts.size() > 2 ? rtts.get(2) : null)
                        .timedOut(timedOut)
                        .icmpType(icmpType)
                        .icmpCode(0)
                        .protocolAction(action)
                        .isDestination(isDest)
                        .build();
            }
        }
        return null;
    }

    private List<Double> extractRtts(String rttText) {
        List<Double> rtts = new ArrayList<>();
        // Match numbers before 'ms' or '<1 ms'
        Pattern rttPattern = Pattern.compile("(<1|\\d+)\\s*ms");
        Matcher m = rttPattern.matcher(rttText);
        while (m.find()) {
            String val = m.group(1);
            if (val.equals("<1")) {
                rtts.add(0.5);
            } else {
                rtts.add(Double.parseDouble(val));
            }
        }
        return rtts;
    }
}
