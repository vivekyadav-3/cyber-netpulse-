package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single hop in a Traceroute path with RFC 792 TTL and ICMP telemetry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TracerouteHop {
    private int hopNumber;
    private int ttl;                  // The IP Header TTL initialized for this probe round
    private String ipAddress;
    private String hostName;
    private Double rtt1Ms;
    private Double rtt2Ms;
    private Double rtt3Ms;
    private boolean timedOut;
    private Integer icmpType;         // 11 = ICMP Time Exceeded, 0 = ICMP Echo Reply
    private Integer icmpCode;         // 0
    private String protocolAction;    // Human-readable RFC 792 action explanation
    private boolean isDestination;
}
