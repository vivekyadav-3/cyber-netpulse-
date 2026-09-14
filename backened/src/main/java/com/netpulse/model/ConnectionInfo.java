package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionInfo {
    private String protocol; // TCP or UDP
    private String localAddress; // e.g. 192.168.1.10
    private int localPort; // e.g. 52740
    private String remoteAddress; // e.g. 142.250.78.14
    private int remotePort; // e.g. 443
    private String state; // ESTABLISHED, LISTENING, TIME_WAIT, etc.
    private String pid; // Process ID
}
