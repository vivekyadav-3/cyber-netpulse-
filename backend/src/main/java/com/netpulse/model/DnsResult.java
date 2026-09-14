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
public class DnsResult {
    private String host;
    private String canonicalHostName;
    private List<String> resolvedIps;
    private long resolutionTimeMs;
    private boolean successful;
    private String errorMessage;
}
