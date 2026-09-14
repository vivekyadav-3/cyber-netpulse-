package com.netpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TracerouteHop {
    private int hopNumber;
    private String ipAddress;
    private String hostName;
    private Double rtt1Ms;
    private Double rtt2Ms;
    private Double rtt3Ms;
    private boolean timedOut;
}
