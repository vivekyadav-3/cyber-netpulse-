package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an RFC 792 / RFC 4443 ICMP Echo Request & Reply packet datagram.
 * Includes RFC 1071 16-bit One's Complement Checksum computation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcmpProbe {
    private int sequenceNumber;
    
    // ICMP Echo Request (RFC 792)
    @Builder.Default
    private int requestType = 8;     // Type 8: Echo Request (Type 128 in ICMPv6)
    @Builder.Default
    private int requestCode = 0;     // Code 0
    @Builder.Default
    private int payloadBytes = 32;   // Default 32-byte data buffer
    private String checksumHex;      // RFC 1071 16-bit One's Complement Checksum (e.g. 0x4D2E)
    private String identifierHex;    // 16-bit Process/Session Identifier (e.g. 0x0001)
    
    // ICMP Echo Reply (RFC 792)
    private Integer replyType;       // Type 0: Echo Reply, 3: Unreachable, 11: TTL Exceeded
    private Integer replyCode;       // Code 0
    private Integer ttl;             // Time To Live extracted from IP header
    private Double rttMs;            // Round-Trip Time in milliseconds
    private String responderIp;      // IP address responding to probe
    private boolean successful;
    private String statusMessage;    // Descriptive packet status

    /**
     * Computes the RFC 1071 16-bit One's Complement Checksum over ICMP Type, Code, ID, Sequence, and Payload.
     */
    public static String computeRfc1071Checksum(int type, int code, int id, int seq, int payloadSize) {
        int length = 8 + payloadSize;
        byte[] buffer = new byte[length];
        buffer[0] = (byte) type;
        buffer[1] = (byte) code;
        buffer[2] = 0; // Checksum initialized to 0
        buffer[3] = 0;
        buffer[4] = (byte) (id >> 8);
        buffer[5] = (byte) id;
        buffer[6] = (byte) (seq >> 8);
        buffer[7] = (byte) seq;

        // Standard Windows/Linux ICMP payload: alphabetical sequence 'a'..'w'
        for (int p = 0; p < payloadSize; p++) {
            buffer[8 + p] = (byte) ('a' + (p % 23));
        }

        int sum = 0;
        int i = 0;
        while (i < length - 1) {
            int word = ((buffer[i] & 0xFF) << 8) | (buffer[i + 1] & 0xFF);
            sum += word;
            i += 2;
        }
        if (i < length) {
            sum += (buffer[i] & 0xFF) << 8;
        }
        while ((sum >> 16) > 0) {
            sum = (sum & 0xFFFF) + (sum >> 16);
        }
        int checksum = (~sum) & 0xFFFF;
        return String.format("0x%04X", checksum);
    }
}
