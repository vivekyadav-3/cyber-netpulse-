package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an RFC 792 ICMP Echo Request / Echo Reply packet probe.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcmpProbe {
    private int sequenceNumber;
    
    // ICMP Echo Request (RFC 792)
    @Builder.Default
    private int requestType = 8;     // Type 8: Echo Request
    @Builder.Default
    private int requestCode = 0;     // Code 0
    @Builder.Default
    private int payloadBytes = 32;   // Default 32-byte data buffer
    
    // ICMP Echo Reply (RFC 792)
    private Integer replyType;       // Type 0: Echo Reply, 3: Unreachable, 11: TTL Exceeded
    private Integer replyCode;       // Code 0
    private Integer ttl;             // Time To Live extracted from IP header
    private Double rttMs;            // Round-Trip Time in milliseconds
    private String responderIp;      // IP address responding to probe
    private boolean successful;
    private String statusMessage;    // Descriptive packet status
}
