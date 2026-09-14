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
public class TracerouteResult {
    private String host;
    private String destinationIp;
    private int totalHops;
    private List<TracerouteHop> hops;
    private long executionTimeMs;
    private boolean reachedDestination;
    private List<String> rawOutput;
}
