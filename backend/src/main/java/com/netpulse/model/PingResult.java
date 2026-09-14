package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PingResult {
    private String host;
    private String ipAddress;
    private int packetsSent;
    private int packetsReceived;
    private double packetLossPercent;
    private Double minRttMs;
    private Double avgRttMs;
    private Double maxRttMs;
    private List<String> rawOutput;
    private boolean reachable;
    private List<IcmpProbe> icmpProbes;
}
